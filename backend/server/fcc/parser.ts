import * as c from "./regexconst";
import helper from "./helper";
import { FCCResult } from "./index";
import * as fs from "fs";
import * as path from "path";
const pdf = require("pdf-parse");

interface CTX {
  rows: number;
  result: string;
  text: string;
  skip: {
    skipNextPartial: boolean;
    key: string;
  };
}

// default render callback
const renderPage = (pageData: any) => {
  // check documents https://mozilla.github.io/pdf.js/
  const renderOptions = {
    // replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    normalizeWhitespace: false,
    // do not attempt to combine same line TextItem's. The default value is `false`.
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(renderOptions).then((textContent: any) => {
    let lastY;
    const ctx: CTX = {
      rows: 0,
      result: "",
      text: "",
      skip: {
        skipNextPartial: false,
        key: "",
      },
    };
    for (const item of textContent.items) {
      if (lastY === item.transform[5] || !lastY) {
        ctx.text += item.str;
      } else {
        findMatch(ctx);
        ctx.text += item.str;
      }
      lastY = item.transform[5];
    }
    return ctx.result;
  });
};

const findMatch = (ctx: CTX) => {
  let { key, val } = partialMatch(ctx.text);
  if (ctx.skip.skipNextPartial) {
    key = ctx.skip.key;
    val = ctx.text;
    // console.log("mixed header", ctx.rows, key, val);
  }
  if (key && key.includes("mixheader")) {
    ctx.skip.skipNextPartial = true;
    ctx.skip.key = key;
  }
  if (val !== null && key !== null) {
    val = val.trim();

    // if(key.includes('input'))
    // console.log("partial [%s][%s]", key, ctx.text);
    ctx.rows += 1;
    const fullMatchVal = match(key, val);
    if (fullMatchVal) {
      // console.log("fullMatchVal [%s][%s]", key, fullMatchVal);
      ctx.result += fullMatchVal + ",";
      ctx.text = "";
      ctx.rows = 0;
    } else if (ctx.rows >= 5) {
      ctx.text = "";
      ctx.rows = 0;
      ctx.skip.skipNextPartial = false;
      ctx.skip.key = "";
    } else if (ctx.skip.skipNextPartial) {
      // if it fails fullmatch evel, this is not a valid line, discard it
      ctx.text = "";
    }
  } else {
    ctx.text = "";
  }
};

const match = (key: string, txt: string) => {
  return c.regExpMap[key][1](txt);
};

const partialMatch = (txt: string) => {
  for (const key in c.regExpMap) {
    if (c.regExpMap[key]) {
      const val = c.regExpMap[key][0](txt);
      if (val !== null) {
        return { key, val };
      }
    }
  }

  return { key: null, val: null };
};

const processPDFFile = (downloadFile: string, uri: string, fccidKey: string, repDateVal: string) => {
  console.log(downloadFile);
  const dataBuffer = fs.readFileSync(downloadFile);
  const options = {
    pagerender: renderPage,
  };

  return pdf(dataBuffer, options).then((data: any) => {
    let res = data.text.replace(/(\r\n|\n|\r)/gm, "");
    res = "[" + res.slice(0, -1) + "]";
    const resultJson: [] = JSON.parse(res);
    const file = uri.split("/").pop() || "dummy.pdf";

    const fccresult: FCCResult = helper.createNewFccResult(fccidKey, file, uri, false, repDateVal);

    resultJson.forEach((e: any) => {
      const key = Object.keys(e)[0];
      const value = e[Object.keys(e)[0]];
      switch (key) {
        case "product":
          if (!fccresult.product) {
            fccresult.product = value;
          }
          break;
        case "productModelNo":
          if (!fccresult.productModelNo.includes(value)) {
            fccresult.productModelNo.push(value);
          }
          break;
        case "brand":
          if (!fccresult.brand) {
            fccresult.brand = value;
          }
          break;
        case "modelNo":
          if (!fccresult.productModelNo.includes(value)) {
            fccresult.modelNo.push(value);
          }
          break;
        case "pn":
          if (!fccresult.pn.includes(value)) {
            fccresult.pn.push(value);
          }
          break;
        case "input":
          populateSpec(fccresult, value, true);
          break;
        case "output":
          populateSpec(fccresult, value, false);
          break;
      }
    });

    console.log("finish processing pdf ", fccidKey);
    return fccresult;
  });
};

const populateSpec = (fccresult: any, value: string, isInput: boolean) => {
  const lastSpec = fccresult.spec.splice(-1).pop();
  // console.log("last spec ", lastSpec);
  if (lastSpec) {
    if (lastSpec.input && lastSpec.output) {
      fccresult.spec.push(lastSpec);
      fccresult.spec.push({
        input: value,
        output: "",
      });
    } else {
      lastSpec.input = isInput ? value : lastSpec.input;
      lastSpec.output = !isInput && lastSpec.input ? value : lastSpec.output;
      fccresult.spec.push(lastSpec);
    }
  } else {
    fccresult.spec.push({
      input: isInput ? value : "",
    });
  }
};

export const processWeb = async (uri: string, fccidKey: string, repDateVal: string) => {
  return helper.fetchAndSave(uri, fccidKey, repDateVal, processPDFFile);
};

const main = () => {
  const filename = "Test-Report-DTS-pdf-2624644.pdf";
  const downloadFile = path.resolve("./data/", filename);
  processPDFFile(downloadFile, "http://dummy/" + filename, "Test", "2019-12-03");
};

// main();
