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
const proxySchema = new Schema(proxySchemaDef);

export default model<ProxyDoc>("Proxy", proxySchema);
