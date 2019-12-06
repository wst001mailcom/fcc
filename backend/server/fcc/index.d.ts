export interface FCCResult {
  fccidPrefix: string;
  fccid: string;
  filename: string;
  url: string;
  product: string;
  productModelNo: string[];
  brand: string;
  modelNo: string[];
  pn: string[];
  spec: SPEC[];
  repDate: string;
  isDummy: boolean;
}

export interface SPEC {
  input: string;
  output: string;
}

export interface FCCInput {
  fccidVal: string | null;
  urlVal: string | null;
  repDateVal: string | null;
}
