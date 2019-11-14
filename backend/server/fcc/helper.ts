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
    proessFn: (filepath: string, uri: string, fccidKey: string) => FCCResult
  ) => Promise<FCCResult> = async (
    url: string,
    fccidKey: string,
    proessFn: (filepath: string, uri: string, fccidKey: string) => FCCResult
  ) => {
    const file = url.split("/").pop() || "dummy.pdf";
    const downloadPath = path.resolve(os.tmpdir());
    const downloadFile = path.resolve(downloadPath, file);
    console.log("Downloading file to:", downloadFile);

    let proxyUrl = Helper.getProxy();
    proxyUrl = proxyUrl === null ? "" : "http://" + proxyUrl;

    const options = {
      method: "GET",
      uri: url,
      // body: request.postData,
      // headers: request.headers,
      headers: {
        "Content-type": "applcation/pdf",
        // Referer: "https://fccid.io/PY319200447/Test-Report/DTS-Test-Report-4485630",
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
      .pipe(writable);

    return new Promise<FCCResult>((res, rej) => {
      stream.on("finish", async () => {
        writable.end();
        const stats = fs.statSync(downloadFile);
        const fileSizeInBytes = stats.size;
        // Convert the file size to megabytes (optional)
        const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

        console.log("finish writing file size in MB is ", fileSizeInMegabytes, downloadFile);
        // process the pdf file
        const result = await proessFn(downloadFile, url, fccidKey);
        // delete the file
        fs.unlinkSync(downloadFile);
        res(result);
      });
      stream.on("error", rej); // or something like that. might need to close `hash`
    });
  };

  public static getProxy = (): string | null => {
    const options = {
      uri: "http://fcc-node-server.herokuapp.com/proxy",
      headers: {
        "User-Agent": "Request-Promise",
      },
      json: true, // Automatically parses the JSON string in the response
    };

    rp(options)
      .then((resp: any) => {
        if (resp !== null && Array.isArray(resp)) {
          console.log("pick up proxy", resp[0]);
          return resp[0];
        } else {
          console.log("fallback to default");
          return "182.16.171.1:53281";
        }
      })
      .catch((err: any) => {
        console.log("check fccid exists err");
      });

    return null;
  };
}
