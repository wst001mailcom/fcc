import bodyParser from "body-parser";
import express from "express";
import { authorize } from "../config";
import FCCResultModel from "./fcc.model";
import * as parser from "./parser";
import { FCCResult } from "./index";

const router = express.Router();
const waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));

router.route("/all").get(authorize, async (_, response) => {
  const fccresults = await FCCResultModel.find();
  return response.status(200).json(fccresults);
});

router.route("/parse").get(async (request, response) => {
  const url = request.query.url;
  if (url) {
    console.log("url is ", url);
    const file = url.split("/").pop() || "dummy.pdf";
    let fccresult: FCCResult = await FCCResultModel.findOne({ filename: file });
    if (!fccresult || !fccresult.product) {
      fccresult = await parser.processWeb(url);
      try {
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
    response.status(400).send("invalid url: " + url);
  }
});

router.route("/batch").get(async (request, response) => {
  const urls = request.query.urls;
  if (urls) {
    console.log("url is ", urls);
    const urlArr: string[] = JSON.parse(urls);

    asyncForEach(urlArr, async (url: string) => {
      await waitFor(5000);
      console.log("processing url [%s]", url);
      const filename = url.split("/").pop() || "dummy.pdf";
      let fccresult: FCCResult = await FCCResultModel.findOne({ filename: filename });
      if (!fccresult || !fccresult.product) {
        fccresult = await parser.processWeb(url);
        try {
          const fcc = new FCCResultModel(fccresult);
          FCCResultModel.findOneAndUpdate({ filename: filename }, fcc, { upsert: true }, (err, doc) => {
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
    response.status(400).send("invalid url: " + urls);
  }
});

const asyncForEach = async (array: string[], callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export default router;
