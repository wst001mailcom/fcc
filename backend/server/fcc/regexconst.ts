export const inputRegexp = /(\d{2,3}[-]\d{2,3}\w{2,3}), (\d{1,2}[.]\d{1,2}\w{1}), (\d{2,3}\/\d{2,3}\w{2})/;
export const outputRegexp = /(\d{1,3}\w{1}), (\d{1,3}[.]\d{0,3}\w{1})/;
export const pnRegexp = /(\d{3}-\d{5}-\d{2})/;

const compare = (txt: string, re: RegExp) => {
  const group = txt.match(re);
  /*
    if(txt && txt.includes('Input'))  {
        console.log(txt);
    }
    */
  if (group) {
    return group[0] ? group[0] : "";
  } else {
    return null;
  }
};

const compareGetJson = (txt: string, re: RegExp, key: string) => {
  const result = compare(txt.trim(), re);
  if (result) {
    const jsonObj: { [key: string]: string } = {};
    jsonObj[key] = result.trim();
    return JSON.stringify(jsonObj);
  } else {
    return null;
  }
};

type FunctionType1 = (x: string) => string | null;
interface FunctionMap {
  [key: string]: FunctionType1[];
}

// Model
const modelPartialRe = new RegExp("(?<=Model)(.*)", "g");
const modelFullRe = new RegExp("(?=.*[0-9])(?=.*[A-Z])([A-Z0-9]+){3,20}", "g");

export const MODEL_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, modelPartialRe);
};

export const MODEL_FULL: FunctionType1 = (txt: string) => {
  if (txt.length > 25) {
    return null;
  }
  return compareGetJson(txt, modelFullRe, "modelNo");
};

// Input Power
const inputPartialRe = new RegExp("(?<=Input Power)(.*)", "g");
const inputFullRe0 = /(\d{2,3}[-]\d{2,3}\w{2,3}[ -~]{1,3}\d{1,2}[.]\d{1,2}\w{1}[ -~]{1,3}\d{2,3}\/\d{2,3}\w{2})/;
const inputFullRe1 = /(\d{2,3}[-]\d{2,3}\w{2,3}[ -~]{1,3}\d{2,3}\/\d{2,3}\w{2}[ -~]{1,3}\d{1,2}[.]\d{1,2}\w{1})/;
export const INPUT_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, inputPartialRe);
};

export const INPUT_FULL: FunctionType1 = (txt: string) => {
  const result = [inputFullRe0, inputFullRe1].map(reg => compare(txt, reg)).find(x => x != null);
  if (result) {
    return JSON.stringify({ input: result });
  } else {
    return null;
  }
};

const inputPartialRe1 = new RegExp("(?<=Input:)(.*)", "g");
export const INPUT_PARTIAL1: FunctionType1 = (txt: string) => {
  return compare(txt, inputPartialRe1);
};

// Output Power
const outputPartialRe = new RegExp("(?<=Output Power)(.*)", "g");
const outputFullRe = /^\d{1,2}(\.\d{1,2})?[a-zA-Z]{1,3}[ -~]{0,3}\d{1,2}(\.\d{1,2})?[a-zA-Z]{1,3}/;

export const OUTPUT_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, outputPartialRe);
};

export const OUTPUT_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, outputFullRe, "output");
};

// Output:
const outputPartialRe1 = new RegExp("(?<=Output:)(.*)", "g");

export const OUTPUT_PARTIAL1: FunctionType1 = (txt: string) => {
  return compare(txt, outputPartialRe1);
};

// GENERAL

/*
      // find product
      populateByFind('Product:', txtList, result, 'product', fetchNextValue);
      // find brand
      populateByFind('Brand:', txtList, result, 'brand', fetchNextValue);
      // find product model no
      populateByFind('Test Model:', txtList, result, 'productModelNo', fetchNextValue);
      // find product model no
      populateByFind('Series Model:', txtList, result, 'productModelNo', fetchNextValue);
*/

// Product
const productPartialRe = new RegExp("(?<=Product:)(.*)", "g");
const productFullRe = /[\S].*/;
export const PRODUCT_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, productPartialRe);
};
export const PRODUCT_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, productFullRe, "product");
};
// Brand:
const brandPartialRe = new RegExp("(?<=Brand:)(.*)", "g");
const brandFullRe = /[\S].*/;
export const BRAND_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, brandPartialRe);
};
export const BRAND_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, brandFullRe, "brand");
};
// Test Model:
const testModelPartialRe = new RegExp("(?<=Test Model:)(.*)", "g");
const testModelFullRe = /[\S].*/;
export const TEST_MODEL_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, testModelPartialRe);
};
export const TEST_MODEL_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, testModelFullRe, "productModelNo");
};
// Series Model:
const seriesModelPartialRe = new RegExp("(?<=Series Model:)(.*)", "g");
const seriesModelFullRe = /[\S].*/;
export const SERIES_MODEL_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, seriesModelPartialRe);
};
export const SERIES_MODEL_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, seriesModelFullRe, "productModelNo");
};

// Series Model:
const pnPartialRe = new RegExp("(?<=P/N)(.*)", "g");
const pnFullRe = /(\d{3}-\d{5}-\d{2})/;
export const PN_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, pnPartialRe);
};
export const PN_FULL: FunctionType1 = (txt: string) => {
  return compareGetJson(txt, pnFullRe, "pn");
};

// Mix Header
const mixHeaderPartialRe = /(?<=Spec\.)(.*)/;
// const mix_header_brand_re = /(?<=\d)(.*?)(?=\d)/;
const mixHeaderBrandRe = /(?<=\s)(\S+)(?=\s)/;

export const MIX_HEADER_PARTIAL: FunctionType1 = (txt: string) => {
  return compare(txt, mixHeaderPartialRe);
};

export const MIX_HEADER_FULL: FunctionType1 = (txt: string) => {
  const result: string[] = [];
  const input = compare(txt, inputPartialRe1);
  const pn = compare(txt, pnFullRe);
  const brand = compare(txt, mixHeaderBrandRe);
  const output = compare(txt, outputPartialRe1);

  if (pn && brand) {
    const modelNoRegexp = "(?<=" + brand + ")(.*)(?=" + pn + ")";
    result.push(compareGetJson(txt, pnFullRe, "pn") || "");
    result.push(compareGetJson(txt, new RegExp(modelNoRegexp, "g"), "modelNo") || "");
    result.push(compareGetJson(brand, brandFullRe, "brand") || "");
  }
  if (input) {
    // console.log("input partial is ", input);
    result.push(INPUT_FULL(input) || "");
    // result.push(compareGetJson(input, inputFullRe1, 'input') || "");
  }
  if (output) {
    // console.log("output partial is [%s]", output);
    result.push(compareGetJson(output, outputFullRe, "output") || "");
  }
  return result.length === 0 ? null : result.join(",");
};

export const regExpMap: FunctionMap = {
  mixheader: [MIX_HEADER_PARTIAL, MIX_HEADER_FULL],
  product: [PRODUCT_PARTIAL, PRODUCT_FULL],
  brand: [BRAND_PARTIAL, BRAND_FULL],
  test_model: [TEST_MODEL_PARTIAL, TEST_MODEL_FULL],
  series_model: [SERIES_MODEL_PARTIAL, SERIES_MODEL_FULL],
  pn: [PN_PARTIAL, PN_FULL],
  model: [MODEL_PARTIAL, MODEL_FULL],
  input: [INPUT_PARTIAL, INPUT_FULL],
  input1: [INPUT_PARTIAL1, INPUT_FULL],
  output: [OUTPUT_PARTIAL, OUTPUT_FULL],
  output1: [OUTPUT_PARTIAL1, OUTPUT_FULL],
};
