import * as fs from "fs";
import * as os from "os";
import { FCCResult } from "./index";
import { resolve } from "dns";
import * as path from "path";
import * as request from "request";
import Proxy from "./proxy.model";

const rp = require("request-promise");

export default class Helper {
  public static waitFor = (ms: number) => new Promise(r => setTimeout(r, ms));

  public static fetchRetry = async (
    url: string,
    fccidKey: string,
    repDateVal: string,
    proessFn: (filepath: string, uri: string, fccidKey: string, repDateVal: string) => FCCResult,
    n: number
  ): Promise<FCCResult> => {
    let proxyUrl = await Helper.getProxy();

    if (Helper.goodProxies.length <= 0) {
      Helper.goodProxies = (await Proxy.find()).map(x => x.url);
    }
    if (n > 0 && n <= 3 && Helper.goodProxies.length > 0) {
      const idx = Math.floor(Math.random() * (Helper.goodProxies.length - 1) + 0);
      console.log("pick up proxy from good list", Helper.goodProxies[idx]);
      proxyUrl = Helper.goodProxies[idx];
    }

    proxyUrl = proxyUrl === null ? "http://182.16.171.1:53281" : "http://" + proxyUrl;

    return Helper.fetchAndSave(url, fccidKey, repDateVal, proessFn, proxyUrl).catch(async error => {
      console.log("got error from fetch and save, retrying....", n, fccidKey);
      if (n === 1) {
        return null;
      }
      await Helper.waitFor(5000);
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
  private static goodProxies: string[] = [];

  private static fetchAndSave = (
    url: string,
    fccidKey: string,
    repDateVal: string,
    proessFn: (filepath: string, uri: string, fccidKey: string, repDateVal: string) => FCCResult,
    proxyUrl: string
  ) => {
    return new Promise<FCCResult>((res, rej) => {
      const file = url.split("/").pop() || "dummy.pdf";
      const downloadPath = path.resolve(os.tmpdir());
      const downloadFile = path.resolve(downloadPath, file);
      console.log("Downloading file to:", downloadFile);

      const referer = url.replace(/\.pdf$/, "");

      console.log("use proxy, refer", proxyUrl, referer);
      const options = {
        method: "GET",
        uri: url,
        // body: request.postData,
        // headers: request.headers,
        headers: {
          // ":authority": "fccid.io",
          // ":method": "GET",
          "Content-type": "applcation/pdf",
          Referer: referer,
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
        },
        // encoding: null,
        proxy: proxyUrl,
      };

      const writable = fs.createWriteStream(downloadFile, { flags: "w+" });
      const stream = request
        .get(options)
        .on("response", (response: any) => {
          console.log("response code on download:", response.statusCode);
          if (response.statusCode >= 500) {
            console.log(response.statusCode, " Server error", options.uri);
          }
        })
        .on("error", (err: any) => {
          console.log("err while requesting for pdf", err);
          Helper.proxies = Helper.proxies.filter(x => x !== proxyUrl);
          if (Helper.goodProxies.includes(proxyUrl)) {
            Helper.goodProxies = Helper.goodProxies.filter(x => x !== proxyUrl);
            Proxy.deleteOne({ url: proxyUrl });
          }
          rej(err);
        })
        .pipe(writable)
        .on("error", (err: any) => {
          console.log("err while writing pdf");
          rej(err);
        });

      stream.on("finish", async () => {
        if (!Helper.goodProxies.includes(proxyUrl)) {
          const proxy = new Proxy();
          proxy.url = proxyUrl;
          proxy.save();
        }
        Helper.goodProxies = [...new Set(Helper.goodProxies), proxyUrl];
        Helper.proxies = Helper.proxies.filter(x => x !== proxyUrl);
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

  private static getProxy = (): Promise<string | null> => {
    return new Promise<string | null>((res, rej) => {
      if (!Helper.proxies || Helper.proxies.length <= 0) {
        const options = {
          uri: "https://fcc-node-server.herokuapp.com/proxy",
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3 Accept-Encoding: gzip, deflate",
            "Accept-Encoding": "gzip, deflate",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
          },
          json: true, // Automatically parses the JSON string in the response
        };

        rp(options)
          .then((resp: any) => {
            if (resp !== null && Array.isArray(resp) && resp.length > 0) {
              Helper.proxies = [...resp];
              const idx = Math.floor(Math.random() * (Helper.proxies.length - 1) + 0);
              console.log("pick up proxy", Helper.proxies[idx]);
              res(Helper.proxies[idx]);
            } else {
              rej(new Error("no proxy found"));
            }
          })
          .catch((err: any) => {
            console.log("get proxy err");
            rej(err);
          });
      } else {
        const idx = Math.floor(Math.random() * (Helper.proxies.length - 1) + 0);
        console.log("pick up proxy", Helper.proxies[idx]);
        res(Helper.proxies[idx]);
      }
    });
  };
}
