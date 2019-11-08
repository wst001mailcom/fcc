import { Document, model, Schema } from "mongoose";
import { SchemaDef } from "../../types";


interface VpnIp {
    source: string,
    ip: string
}

// Declare model interface
interface VpnIpDoc extends VpnIp, Document {}

const vpnIpSchemaDef: SchemaDef<VpnIp> = {
  source: {
    type: String,
    unique: true,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
};

// Define model schema
const vpnIpSchema = new Schema(vpnIpSchemaDef, {_id: false,   toJSON: {
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
    }
  }});

export default model<VpnIpDoc>("VpnIp", vpnIpSchema);
