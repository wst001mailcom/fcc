import bodyParser from "body-parser";
import express from "express";
import { authorize } from "../config";
import FCCResultModel from "./fcc.model";
import * as parser from "./parser";
import { FCCResult, FCCInput } from "./index";
import Helper from "./helper";

const router = express.Router();
const waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));

router.route("/all").get(authorize, async (_, response) => {
  const fccresults = await FCCResultModel.find();
  return response.status(200).json(fccresults);
});

router.route("/exists").get(async (request, response) => {
  const fccidVal = request.query.fccid;
  const fccresults = await FCCResultModel.findOne({ fccid: fccidVal });
  return response.status(200).json(fccresults);
});

router.route("/proxy").get(async (request, response) => {
  return response.status(200).json(await Helper.getProxy());
});

router.route("/parse").get(async (request, response) => {
  const fccinput: FCCInput = request.query.url;
  const { fccidVal, urlVal, repDateVal } = fccinput;
  if (urlVal && fccidVal) {
    console.log("url is ", fccidVal, urlVal);
    const file = urlVal.split("/").pop() || "dummy.pdf";
    let fccresult: FCCResult = await FCCResultModel.findOne({ fccid: fccidVal });
    if (!fccresult || !fccresult.product) {
      try {
        fccresult = await parser.processWeb(urlVal, fccidVal, repDateVal);
        const fcc = new FCCResultModel(fccresult);
        FCCResultModel.findOneAndUpdate({ filename: file }, fcc, { upsert: true }, (err, doc) => {
          if (err) {
            return response.status(400).send(err);
          }
        });
      } catch (error) {
        return response.status(400).send(error);
      }
    }
    return response.status(200).json(fccresult || {});
  } else {
    response.status(400).send("invalid url: " + urlVal);
  }
});

router.route("/batch").post(bodyParser.json(), async (request, response) => {
  const urlArr = request.body;
  if (urlArr) {
    console.log("url is ", urlArr);

    asyncForEach(urlArr, async (fccinput: FCCInput) => {
      const { fccidVal, urlVal, repDateVal } = fccinput;
      await waitFor(5000);
      console.log("processing url [%s]", urlVal);
      const file = urlVal.split("/").pop() || "dummy.pdf";
      let fccresult: FCCResult = await FCCResultModel.findOne({ fccid: fccidVal });
      if (!fccresult) {
        const fccresultDummy = Helper.createNewFccResult(fccidVal, file, urlVal, true, repDateVal);
        const fcc = new FCCResultModel(fccresultDummy);
        FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
          if (err) {
            console.log("Err: %S", err);
          }
        });
      }
      if (!fccresult || fccresult.isDummy) {
        try {
          fccresult = await parser.processWeb(urlVal, fccidVal, repDateVal);
          const fcc = new FCCResultModel(fccresult);
          FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
            if (err) {
              console.log("Err: %S", err);
            }
          });
        } catch (error) {
          console.log("Error: %S", error);
        }
      }
    });

    response.status(200).send("done");
  } else {
    response.status(400).send("invalid url: " + urlArr);
  }
});

router.route("/update").post(bodyParser.json(), async (request, response) => {
  const urlArr = request.body;
  if (urlArr) {
    asyncForEach(urlArr, async (fccinput: FCCInput) => {
      const { fccidVal, urlVal, repDateVal } = fccinput;
      const fccresult: FCCResult = await FCCResultModel.findOne({ fccid: fccidVal });
      if (fccresult && !fccresult.repDate) {
        console.log("update fccid ", fccidVal, repDateVal);
        fccresult.repDate = repDateVal;
        const fcc = new FCCResultModel(fccresult);
        FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
          if (err) {
            console.log("Err: %S", err);
          }
        });
      }
    });

    response.status(200).send("done");
  } else {
    response.status(400).send("invalid url: " + urlArr);
  }
});

const asyncForEach = async (array: string[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export default router;
