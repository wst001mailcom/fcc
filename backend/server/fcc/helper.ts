import * as fs from "fs";
import * as os from "os";
import { FCCResult } from "./index";
import { resolve } from "dns";
import * as path from "path";
import * as request from "request";
const rp = require("request-promise");

export default class Helper {
  public static waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));

  public static fetchRetry = (
    url: string,
    fccidKey: string,
    repDateVal: string,
    proessFn: (filepath: string, uri: string, fccidKey: string, repDateVal: string) => FCCResult,
    n: number
  ): Promise<FCCResult> => {
    return Helper.fetchAndSave(url, fccidKey, repDateVal, proessFn).catch(async error => {
      if (n === 1) {
        return null;
      }
      await Helper.waitFor(1000);
      return Helper.fetchRetry(url, fccidKey, repDateVal, proessFn, n - 1);
    });
  };

  public static createNewFccResult = (fccidKey: string, file: string, uri: string, isDummyVal: boolean, repDateVal: string): FCCResult => {
    return {
      fccidPrefix: fccidKey.substring(0, 3),
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

  private static proxies: string[] = [];

  private static fetchAndSave = async (
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
        throw err;
      })
      .pipe(writable)
      .on("error", (err: any) => {
        console.log("err while writing pdf");
        throw err;
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

  private static getProxyRetry = async (n: number): Promise<string | null> => {
    return Helper.getProxy().catch(async error => {
      if (n === 1) {
        return null;
      }
      await Helper.waitFor(1000);
      return Helper.getProxyRetry(n - 1);
    });
  };

  private static getProxy = async (): Promise<string | null> => {
    if (!Helper.proxies || Helper.proxies.length <= 0) {
      const options = {
        uri: "https://fcc-node-server.herokuapp.com/proxy",
        headers: {
          "User-Agent": "Request-Promise",
        },
        json: true, // Automatically parses the JSON string in the response
      };

      await rp(options)
        .then((resp: any) => {
          if (resp !== null && Array.isArray(resp) && resp.length > 0) {
            Helper.proxies = [...resp];
          }
        })
        .catch((err: any): string | null => {
          console.log("check fccid exists err", err);
          return null;
        });
    }

    if (Helper.proxies.length > 0) {
      const idx = Math.floor(Math.random() * (Helper.proxies.length - 1) + 0);
      console.log("pick up proxy", Helper.proxies[idx]);
      return Helper.proxies[idx];
    } else {
      throw new Error("no proxy found");
    }
  };
}
