export interface FCCResult {
  fccid: string;
  filename: string;
  url: string;
  product: string;
  productModelNo: string[];
  brand: string;
  modelNo: string[];
  pn: string[];
  spec: SPEC[];
  isDummy: boolean;
}

export interface SPEC {
  input: string;
  output: string;
}

export interface FCCInput {
  fccid: string;
  url: string;
}
