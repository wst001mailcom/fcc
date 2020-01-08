// tslint:disable-next-line:no-var-requires
const rp = require("request-promise");
const uriBase = "http://localhost:8081/api/fcc/";

export class Helper {
  public static updateParam = (urls: FCCInput[]) => {
    const options = {
      method: "POST",
      uri: uriBase + "update",
      body: urls,
      json: true, // Automatically stringifies the body to JSON
    };

    rp(options)
      .then((resp: any) => {
        console.log("upload batch done", resp);
      })
      .catch((err: any) => {
        console.log("upload batch failed");
      });
  };

  public static checkFccIdExists = async (fccid: string): Promise<boolean> => {
    const options = {
      uri: uriBase + "exists/",
      qs: {
        fccid: fccid, // -> uri + '?access_token=xxxxx%20xxxxx'
      },
      headers: {
        "User-Agent": "Request-Promise",
      },
      json: true, // Automatically parses the JSON string in the response
    };

    const result = await rp(options)
      .then((resp: any) => {
        // console.log(resp);
        if (resp) {
          if (!resp.isDummy) {
            // console.log("this is good", resp.fccid);
            if (!resp.spec || resp.spec.length === 0) {
              return false;
            }
            return true;
          } else {
            return false;
          }
        }
      })
      .catch((err: any) => {
        console.log("check fccid exists err");
        return false;
      });

    if (!result) {
      console.log("need to get this", fccid);
    }
    return result;
  };

  public static startBatch = (urls: FCCInput[]) => {
    const options = {
      method: "POST",
      uri: uriBase + "batch/",
      body: urls,
      json: true, // Automatically stringifies the body to JSON
    };

    rp(options)
      .then((resp: any) => {
        console.log("upload batch done", resp);
      })
      .catch((err: any) => {
        console.log("upload batch failed");
      });
  };
}

export interface FCCInput {
  fccidVal: string | null;
  urlVal: string | null;
  repDateVal: string | null;
}
