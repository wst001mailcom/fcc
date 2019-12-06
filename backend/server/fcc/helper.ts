import * as fs from "fs";
import * as os from "os";
import { FCCResult } from "./index";
import { resolve } from "dns";
import * as path from "path";
import * as request from "request";
const rp = require("request-promise");

export default class Helper {
  public static fetchAndSave: (
    url: string,
    fccidKey: string,
    repDateVal: string,
    proessFn: (filepath: string, uri: string, fccidKey: string, repDateVal: string) => FCCResult
  ) => Promise<FCCResult> = async (
    url: string,
    fccidKey: string,
    repDateVal: string,
    proessFn: (filepath: string, uri: string, fccidKey: string, repDateVal: string) => FCCResult
  ) => {
    const file = url.split("/").pop() || "dummy.pdf";
    const downloadPath = path.resolve(os.tmpdir());
    const downloadFile = path.resolve(downloadPath, file);
    console.log("Downloading file to:", downloadFile);

    let proxyUrl = await Helper.getProxy();
    proxyUrl = proxyUrl === null ? "http://182.16.171.1:53281" : "http://" + proxyUrl;
    const referer = url.replace(/\.pdf$/, "");

    console.log("use proxy, refer", proxyUrl, referer);
    const options = {
      method: "GET",
      uri: url,
      // body: request.postData,
      // headers: request.headers,
      headers: {
        "Content-type": "applcation/pdf",
        Referer: referer,
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      // encoding: null,
      proxy: proxyUrl,
    };

    const writable = fs.createWriteStream(downloadFile, { flags: "w+" });
    const stream = await request
      .get(options)
      .on("response", (response: any) => {
        console.log("response code on download:", response.statusCode);
        if (response.statusCode >= 500) {
          console.log(response.statusCode, " Server error", options.uri);
        }
      })
      .on("error", (err: any) => {
        console.log("err while requesting for pdf");
      })
      .pipe(writable)
      .on("error", (err: any) => {
        console.log("err while writing pdf");
      });

    return new Promise<FCCResult>((res, rej) => {
      stream.on("finish", async () => {
        writable.end();
        const stats = fs.statSync(downloadFile);
        const fileSizeInBytes = stats.size;
        // Convert the file size to megabytes (optional)
        const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

        console.log("finish writing file size in MB is ", fileSizeInMegabytes, downloadFile);
        // process the pdf file
        const result = await proessFn(downloadFile, url, fccidKey, repDateVal);
        // delete the file
        fs.unlinkSync(downloadFile);
        res(result);
      });
      stream.on("error", rej); // or something like that. might need to close `hash`
    });
  };

  public static getProxy = async (): Promise<string | null> => {
    const options = {
      uri: "https://fcc-node-server.herokuapp.com/proxy",
      headers: {
        "User-Agent": "Request-Promise",
      },
      json: true, // Automatically parses the JSON string in the response
    };

    const url = await rp(options)
      .then((resp: any) => {
        if (resp !== null && Array.isArray(resp) && resp.length > 0) {
          const idx = Math.floor(Math.random() * (resp.length - 1) + 0);
          console.log("pick up proxy", resp[0]);
          return resp[0];
        } else {
          console.log("fallback to default");
          return "182.16.171.1:53281";
        }
      })
      .catch((err: any): string | null => {
        console.log("check fccid exists err", err);
        return null;
      });

    console.log("url ", url);
    return url;
  };

  public static createNewFccResult = (fccidKey: string, file: string, uri: string, isDummyVal: boolean, repDateVal: string): FCCResult => {
    return {
      fccid: fccidKey,
      url: uri,
      filename: file,
      product: "",
      productModelNo: [],
      brand: "",
      modelNo: [],
      pn: [],
      spec: [],
      repDate: repDateVal,
      isDummy: isDummyVal,
    };
  };
}
