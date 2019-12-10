import { Document, model, Schema } from "mongoose";
import { SchemaDef } from "../../types";
import { Proxy } from "./index";

// Declare model interface
interface ProxyDoc extends Proxy, Document {}

const proxySchemaDef: SchemaDef<Proxy> = {
  url: {
    type: String,
    required: true,
    unique: true,
  },
};

// Define model schema
const proxySchema = new Schema(proxySchemaDef, {
  _id: false,
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    },
  },
});

export default model<ProxyDoc>("Proxy", proxySchema);
