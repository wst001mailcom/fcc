export interface FCCResult {
  filename: string;
  url: string;
  product: string;
  productModelNo: string[];
  brand: string;
  modelNo: string[];
  pn: string[];
  spec: SPEC[];
}

export interface SPEC {
  input: string;
  output: string;
}
