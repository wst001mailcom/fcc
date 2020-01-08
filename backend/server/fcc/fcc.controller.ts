import bodyParser from "body-parser";
import express from "express";
import { authorize } from "../config";
import FCCResultModel from "./fcc.model";
import * as parser from "./parser";
import { FCCResult, FCCInput } from "./index";
import Helper from "./helper";
import FetchFCC from "../fccscrapper/index";

const router = express.Router();

const fetchFCC = new FetchFCC();

router.route("/parse").get(async (request: any, response: any) => {
  const productMasterId = request.query.pmid;
  if (productMasterId) {
    fetchFCC
      .fetchTables(productMasterId, false)
      .then(result => {
        console.log("result is ", result);
      })
      .catch((err: any) => {
        response.send("problem " + err);
      });

    response.send("done");
  } else {
    response.send("invalid product master id: " + productMasterId);
  }
});
router.route("/all").get(authorize, async (_, response) => {
  const fccresults = await FCCResultModel.find();
  return response.status(200).json(fccresults);
});

router.route("/exists").get(async (request, response) => {
  const fccidVal = request.query.fccid;
  const fccresults = await FCCResultModel.findOne({ fccid: fccidVal });
  return response.status(200).json(fccresults);
});

router.route("/parsePDF").get(async (request, response) => {
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
    return response.status(400).send("invalid url: " + urlVal);
  }
});

router.route("/batch").post(bodyParser.json(), async (request, response) => {
  const urlArr = request.body;
  if (urlArr) {
    console.log("url is ", urlArr);

    asyncForEach(
      urlArr,
      async (fccinput: FCCInput, index: number) => {
        const { fccidVal, urlVal, repDateVal } = fccinput;
        // await waitFor(index * 2000);
        const file = urlVal.split("/").pop() || "dummy.pdf";
        const fccresult: FCCResult = await FCCResultModel.findOne({ fccid: fccidVal });
        if (!fccresult) {
          const fccresultDummy = Helper.createNewFccResult(fccidVal, file, urlVal, true, repDateVal);
          const fcc = new FCCResultModel(fccresultDummy);
          FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
            if (err) {
              console.log("Err: %S", err);
            }
          });
        }
        if (!fccresult || fccresult.isDummy || !fccresult.spec || fccresult.spec.length === 0) {
          try {
            const newFccresult = await parser.processWeb(urlVal, fccidVal, repDateVal);
            if (fccresult) {
              const fcc = new FCCResultModel(newFccresult);
              FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
                if (err) {
                  console.log("Err: %S", err);
                }
              });
            }
          } catch (err) {
            console.log("Error: %S", err);
          }
        }
      },
      () => {
        console.log("finish batch ", urlArr);
      }
    );
    return response.status(202).send("Processing batch");
  } else {
    return response.status(400).send("invalid url: " + urlArr);
  }
});

router.route("/update").post(bodyParser.json(), async (request, response) => {
  const urlArr = request.body;
  if (urlArr) {
    asyncForEach(
      urlArr,
      async (fccinput: FCCInput, index: number) => {
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
        } else if (fccresult && !fccresult.fccidPrefix) {
          console.log("update fccid prefix", fccidVal);
          fccresult.fccidPrefix = fccidVal.substring(0, 3);
          const fcc = new FCCResultModel(fccresult);
          FCCResultModel.findOneAndUpdate({ fccid: fccidVal }, fcc, { upsert: true }, (err, doc) => {
            if (err) {
              console.log("Err: %S", err);
            }
          });
        }
      },
      () => {
        return response.status(200).send("Done");
      }
    );
  } else {
    return response.status(400).send("invalid url: " + urlArr);
  }
});

const asyncForEach = async (urls: FCCInput[], callback: (input: FCCInput, idx: number) => void, callbackPostLoop: any) => {
  for (let index = 0; index < urls.length; index++) {
    try {
      console.log("processing value ", urls[index]);
      await callback(urls[index], index);
    } catch (err) {
      console.log("error in loop");
    }
  }
  callbackPostLoop();
};

export default router;
