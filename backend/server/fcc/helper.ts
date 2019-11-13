import * as fs from "fs";
import * as os from "os";
import { FCCResult } from "./index";
import { resolve } from "dns";
import * as path from "path";
import * as request from "request";

export default class Helper {
  public static fetchAndSave: (url: string, proessFn: (filepath: string, uri: string) => FCCResult) => Promise<FCCResult> = async (
    url: string,
    proessFn: (filepath: string, uri: string) => FCCResult
  ) => {
    const file = url.split("/").pop() || "dummy.pdf";
    const downloadPath = path.resolve(os.tmpdir());
    const downloadFile = path.resolve(downloadPath, file);
    console.log("Downloading file to:", downloadFile);

    const options = {
      method: "GET",
      uri: url,
      // body: request.postData,
      // headers: request.headers,
      headers: {
        "Content-type": "applcation/pdf",
        Referer: "https://fccid.io/PY319200447/Test-Report/DTS-Test-Report-4485630",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      // encoding: null,
      proxy: "http://191.96.42.182:3121",
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
        const result = await proessFn(downloadFile, url);
        // delete the file
        fs.unlinkSync(downloadFile);
        res(result);
      });
      stream.on("error", rej); // or something like that. might need to close `hash`
    });
  };
}
