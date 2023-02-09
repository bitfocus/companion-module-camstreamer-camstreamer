/* eslint-disable no-unused-vars */
import util from "util";


import { request, HttpClient } from "urllib";

// ########################
// #### Value Look Ups ####
// ########################

const streamdefinition = {
  type: "dropdown",
  label: "StreamId",
  id: "StreamId",

  // choices: self.streamids,
  required: true,
  range: false,
};

var cmd = "";
var param = "";


// ######################
// #### Send Actions ####
// ######################

async function sendcamstreamer(self, streamid, action) {
  console.log("debug", "Sending camstreamer " + streamid + '-'+action );
  if (action) {
    const url =
      "http://" +
      self.config.host +
      ":" +
      self.config.httpPort +
      "/local/camstreamer/stream/set.cgi?stream_id="+streamid+"&enabled=" +
      action
   
   console.log("debug", `Sending camstreamer : ${url}`);
  
    const urllib = new HttpClient();
    try {
      await urllib.request(url, self.config.authtext);
      self.getstreams();
      self.getoverlays();
      //  this.getstreamstatus();
      // this.init_actions(); // export actions
  
      self.checkFeedbacks();
    } catch (err) {
      console.log("debug", `Action failed: ${url} + ${err}`);
    }
  }
}
async function sendcamoverlay(self, action) {
  //self.log("debug", "Sending camstreamer " + action + ":" + direction);
  if (action) {
    const url =
      "http://" +
      self.config.host +
      ":" +
      self.config.httpPort +
      "/local/camoverlay/api/enabled.cgi?id_" +
      action;

    self.log("debug", `Sending camstreamer : ${url}`);

    const urllib = new HttpClient();
    try {
      await urllib.request(url, self.config.authtext);

      self.checkFeedbacks();
    } catch (err) {
      console.log("debug", `Action failed: ${url} + ${err}`);
    }
  }
}

// ##########################
// #### Instance Actions ####
// ##########################
export function getActionDefinitions(self) {
  const actions = {};

  // ##########################
  // #### Stream Actions ####
  // ##########################
  if (self.streamids.length > 0) {
    actions.stopstream = {
      name: "Stop Stream",

      options: [
        {
          type: "dropdown",
          label: "streamid",
          id: "StreamId",
          choices: self.streamids,
        },
      ],
      callback: async (action) => {
        cmd = "0";
        await sendcamstreamer(self, action.options.StreamId, cmd);
      },
    };

    actions.startstream = {
      name: "Start Stream",

      options: [
        {
          type: "dropdown",
          label: "streamid",
          id: "StreamId",
          choices: self.streamids,
        },
      ],
      callback: async (action) => {
        cmd = "1";
        await sendcamstreamer(self, action.options.StreamId, cmd);
      },
    };
  }
  // ##########################
  // #### Overlay Actions ####
  // ##########################

  if (self.camoverlay_enabled) {
    actions.enableOverlay = {
      name: "Enable Overlay",

      options: [
        {
          type: "dropdown",
          label: "Overlayid",
          id: "OverlayId",
          // default: self.streamids[0].id,
          choices: self.overlayids,
        },
      ],
      callback: async (action) => {
        console.log(
          util.inspect(action.options, {
            showHidden: false,
            depth: null,
            colors: true,
          })
        );

        cmd = action.options.OverlayId + "=1";

        await sendcamoverlay(self, cmd);
      },
    };

    actions.disableOverlay = {
      name: "Disable Overlay",

      options: [
        {
          type: "dropdown",
          label: "Overlayid",
          id: "OverlayId",
          // default: self.streamids[0].id,
          choices: self.overlayids,
        },
      ],
      callback: async (action) => {
        //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

        cmd = action.options.OverlayId + "=0";
        //self.camstreamerMove(param, cmd, opt.speed)

        await sendcamoverlay(self, cmd);
      },
    };
  }



  return actions;
}
