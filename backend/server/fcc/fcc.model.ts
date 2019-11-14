import { Document, model, Schema } from "mongoose";
import { SchemaDef } from "../../types";
import { FCCResult, SPEC } from "./index";

// Declare model interface
interface FCCResultDoc extends FCCResult, Document {}

const specSchemaDef: SchemaDef<SPEC> = {
  input: {
    type: String,
  },
  output: {
    type: String,
  },
};

const fccResultSchemaDef: SchemaDef<FCCResult> = {
  fccid: {
    type: String,
    unique: true,
    required: true,
  },
  filename: {
    type: String,
    unique: true,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    required: false,
  },
  productModelNo: {
    type: [String],
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  modelNo: {
    type: [String],
    required: false,
  },
  pn: {
    type: [String],
    required: false,
  },
  spec: {
    type: [specSchemaDef],
    required: false,
  },
};

// Define model schema
const fccResultSchema = new Schema(fccResultSchemaDef, {
  _id: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
});

export default model<FCCResultDoc>("FccResult", fccResultSchema);
