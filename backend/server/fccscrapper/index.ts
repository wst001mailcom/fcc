import actions from "./actions";
import * as c from "./constants";
import { Page } from "puppeteer";
import { Helper, FCCInput } from "./helper";
import puppeteer from "puppeteer";

export function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  return Array.prototype.concat(...array.map(callbackfn));
}
export default class FetchFCC {
  public fetchTables = async (pmid: string, updateOnly: boolean): Promise<FCCInput[]> => {
    const result: FCCInput[] = [];
    const currentUrl = "https://fccid.io/" + pmid;
    try {
      console.log("Start processing url [%s]", pmid);

      const page = await actions
        .openNewPage(currentUrl)
        .catch((err: any) => console.log("error while opening fetchTables", currentUrl, err));
      if (page) {
        await page.waitForSelector(c.FCC_TEST_REPORT_FCCID_DATE);

        const pdfUrl: FCCInput[] = await page.$$eval(c.FCC_TEST_REPORT_FCCID_DATE, (tds: any) => {
          return tds
            .map((td: any) => {
              const link = td.querySelector("a");
              if (link && td.textContent && link.textContent) {
                return {
                  fccidVal: link.textContent,
                  urlVal: link.getAttribute("href"),
                  repDateVal: td.textContent.replace(link.textContent, ""),
                };
              }
              // return null;
            })
            .filter((x: any) => x);
        });

        await page.close();
        await actions.closeBrowser();

        if (pdfUrl) {
          if (updateOnly) {
            Helper.updateParam(pdfUrl);
            return result;
          }

          const navResult = async (arr: FCCInput[], callback: any, aggrArray: FCCInput[], batchCount: number, batchCallback: any) => {
            for (const fcc of arr) {
              aggrArray.push(...(await callback(fcc)));
              if (batchCallback && aggrArray.length >= batchCount) {
                await batchCallback(aggrArray);
                aggrArray = [];
              }
            }
            if (batchCallback) {
              await batchCallback(aggrArray);
            }
          };

          await navResult(pdfUrl, this.navigateTestReport, result, 5, async (fccInputs: FCCInput[]) => {
            await navResult(fccInputs, this.downloadPdf, [], 5, Helper.startBatch);
          });
        }
      } else {
        console.log("Error! pmid is no good " + pmid);
      }
    } catch (err) {
      console.log("fetchTables err", err);
    }

    return result;
  };

  public asyncForEach = async (array: FCCInput[], callback: any) => {
    if (array) {
      // tslint:disable-next-line:prefer-for-of
      for (let index = 0; index < array.length; index++) {
        await callback(array[index].fccidVal, array[index].urlVal, array[index].repDateVal);
      }
    }
  };

  public navigateTestReport = async (fccInput: FCCInput): Promise<FCCInput[]> => {
    if (!fccInput || !fccInput.urlVal || !fccInput.fccidVal) {
      return [];
    }
    try {
      console.log("checking fcc id ", fccInput.fccidVal);
      const isExists = await Helper.checkFccIdExists(fccInput.fccidVal);
      if (!isExists) {
        const page = await actions.openNewPage(fccInput.urlVal).catch((err: any) => {
          console.log("error while opening navigateTestReport", fccInput.urlVal, err);
          return null;
        });
        if (page != null) {
          await page.waitForSelector(c.FCC_TEST_REPORT_PAGE_SELECTOR);

          const urls: string[] = await page.$$eval(c.FCC_TEST_REPORT_PAGE_SELECTOR, (ee: any) => {
            return ee
              .filter((link: any) => link.textContent != null && link.textContent.toLowerCase().includes("test report"))
              .map((x: any) => x.getAttribute("href"));
          });
          await page.close();
          await actions.closeBrowser();

          return urls
            .filter(x => x)
            .map(x => {
              return { fccidVal: fccInput.fccidVal, urlVal: x, repDateVal: fccInput.repDateVal };
            });
        }
      }
    } catch (err) {
      console.log("navigateTestReport err", err);
    }

    return [];
  };

  public downloadPdf = async (fccInput: FCCInput): Promise<FCCInput[]> => {
    if (!fccInput || !fccInput.urlVal || !fccInput.fccidVal) {
      return [];
    }
    try {
      const page = await actions.openNewPage(fccInput.urlVal).catch((err: any) => {
        console.log("error while opening downloadPdf", fccInput.urlVal, err);
        return null;
      });
      if (page != null) {
        let downloadSelector = c.FCC_TEST_REPORT_PDF_SELECTOR_ALT;
        try {
          await page.waitForSelector(downloadSelector, {
            timeout: 10000,
          });
        } catch (err) {
          downloadSelector = c.FCC_TEST_REPORT_PDF_SELECTOR;
        }

        const url: string = await page.$$eval(downloadSelector, (ee: any) => {
          if (ee.length >= 1) {
            const e = ee.find((link: any) => link.textContent != null && link.textContent.toLowerCase().includes("download"));
            return e.getAttribute("href");
          } else {
            if (ee.length > 0) {
              const e = ee[0] as HTMLElement;
              return e.getAttribute("href");
            } else {
              return null;
            }
          }
        });
        await page.close();
        await actions.closeBrowser();

        return url ? [{ fccidVal: fccInput.fccidVal, urlVal: url, repDateVal: fccInput.repDateVal }] : [];
      }
    } catch (err) {
      console.log("download pdf err", err);
    }
    return [];
  };

  public fetchProxy = async () => {
    const url = "https://hidemy.name/en/proxy-list";
    const page = await actions.openNewPage(url).catch((err: any) => console.log("error while opening page", url, err));
    try {
      if (page) {
        console.log("reading");
        await page.waitForSelector(c.PROXY_MAIN_PORT);
        console.log("found it");

        const proxyList = await page.evaluate((selector: any) => {
          const proxyRows: NodeListOf<Element> = document.querySelectorAll(selector);
          let proxies: string[] = [];
          proxyRows.forEach(e => {
            proxies.push(e.textContent || "bad proxy");
          });

          proxies = proxies.filter((e: string, idx: number) => {
            if (idx === 0 || idx === 1 || idx % 7 === 0 || (idx - 1) % 7 === 0) {
              return true;
            } else {
              return false;
            }
          });

          const result: string[] = [];
          for (let i = 0; i < proxies.length; i += 2) {
            result.push(proxies[i] + ":" + proxies[i + 1]);
          }
          return result;
        }, c.PROXY_MAIN_PORT);

        proxyList.forEach((e: string) => console.log(e));
        console.log("found it", proxyList);

        return proxyList;
      }
    } catch (err) {
      console.log("fetchProxy err", err);
    } finally {
      if (page) {
        await page.close();
      }
      await actions.closeBrowser();
    }
    return [];
  };
}

// const ff = new FetchFCC();
// ff.fetchTables('PY3', false);
// ff.fetchProxy();
