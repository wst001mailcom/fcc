import * as bodyParser from "body-parser";
import * as express from "express";
import { authorize } from "../config";
import VpnIp from "./vpnip.model";

const router = express.Router();

router.route("/").get( async (request, response) => {
  const vpnips = await VpnIp.findOne({"source": request.query.source});
  return response.status(200).json(vpnips || {});
});

router.route("/").put(bodyParser.json(), async (request, response) => {
  try {
    const vpnip = new VpnIp(request.body);
    VpnIp.findOneAndUpdate({"source": request.body.source}, 
        vpnip, {upsert :true}, (err, doc) => {
            if(err) {
                return response.status(400).send(err);
            } else {
                return response.status(200).json("Ip saved!");
            }
        }
    );
    /*
    await vpnip.save();
    return response.status(200).json("Ip saved!");
    */
  } catch (error) {
    return response.status(400).send(error);
  }
});

export default router;
