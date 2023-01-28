/* eslint-disable no-unused-vars */
import util from "util";
//import { c } from "./choices.js";

import { request, HttpClient } from "urllib";

// ########################
// #### Value Look Ups ####
// ########################
const speeddefinition = {
  type: "number",
  label: "Speed",
  id: "speed",
  min: 1,
  max: 100,
  default: 50,
  step: 1,
  required: true,
  range: false,
};
const zoomdefinition = {
  type: "number",
  label: "ZoomSpeed",
  id: "zoomspeed",
  min: 0,
  max: 10000,
  default: 50,
  step: 1,
  required: true,
  range: false,
};
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
const CHOICES_IRIS = [];
for (let i = 0; i < 100; ++i) {
  CHOICES_IRIS.push({
    id: ("0" + i.toString(10)).substr(-2, 2),
    label: "Iris " + i,
  });
}

const CHOICES_PRESET = [];
for (let i = 1; i < 100; ++i) {
  CHOICES_PRESET.push({
    id: ("0" + i.toString(10)).substr(-2, 2),
    label: "Preset " + i,
  });
}

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
  if (self.camstreamer_enabled) {
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

  actions.right = {
    name: "Pan/Tilt - Pan Right",
    options: [
      {
        type: "dropdown",
        label: "StreamId",
        id: "StreamId",

        choices: self.streamids,
      },
    ],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = action.options.speed + ",0";
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.up = {
    name: "Pan/Tilt - Tilt Up",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "0," + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.down = {
    name: "Pan/Tilt - Tilt Down",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "0," + "-" + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.upLeft = {
    name: "Pan/Tilt - Up Left",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "-" + action.options.speed + "," + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.upRight = {
    name: "Pan/Tilt - Up Right",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = action.options.speed + "," + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.downLeft = {
    name: "Pan/Tilt - Down Left",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "-" + action.options.speed + "," + "-" + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.downRight = {
    name: "Pan/Tilt - Down Right",
    options: [speeddefinition],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = action.options.speed + "," + "-" + action.options.speed;
      //self.camstreamerMove(param, cmd, opt.speed)

      await sendcamstreamer(self, cmd, param);
    },
  };

  actions.stop = {
    name: "Pan/Tilt - Stop",
    options: [],
    callback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "0,0";

      await sendcamstreamer(self, cmd, param);
      self.getCameraPosition();
      self.checkFeedbacks();
    },
  };

  actions.home = {
    name: "Pan/Tilt - Home",
    options: [],
    ccallback: async (action) => {
      //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

      cmd = "continuouspantiltmove";
      param = "0,0";

      await sendcamstreamer(self, cmd, param);
    },
  };

  const seriesActions = {};
  seriesActions.ptSpeed = false;

  if (seriesActions.ptSpeed) {
    actions.ptSpeedS = {
      name: "Pan/Tilt - Speed",
      options: [
        {
          type: "dropdown",
          label: "speed setting",
          id: "speed",
          default: 25,
          choices: c.CHOICES_SPEED,
        },
      ],
      callback: async (action) => {
        self.ptSpeed = action.options.speed;

        const idx = c.CHOICES_SPEED.findIndex((sp) => sp.id === self.ptSpeed);
        if (idx > -1) {
          self.ptSpeedIndex = idx;
        }

        self.ptSpeed = c.CHOICES_SPEED[self.ptSpeedIndex].id;
        self.setVariable("ptSpeedVar", self.ptSpeed);
      },
    };
  }

  if (seriesActions.ptSpeed) {
    actions.ptSpeedU = {
      name: "Pan/Tilt - Speed Up",
      options: [],
      callback: async (action) => {
        if (self.ptSpeedIndex == 0) {
          self.ptSpeedIndex = 0;
        } else if (self.ptSpeedIndex > 0) {
          self.ptSpeedIndex--;
        }
        self.ptSpeed = c.CHOICES_SPEED[self.ptSpeedIndex].id;
        self.setVariable("ptSpeedVar", self.ptSpeed);
      },
    };
  }

  if (seriesActions.ptSpeed) {
    actions.ptSpeedD = {
      name: "Pan/Tilt - Speed Down",
      options: [],
      callback: async (action) => {
        if (self.ptSpeedIndex == c.CHOICES_SPEED.length) {
          self.ptSpeedIndex = c.CHOICES_SPEED.length;
        } else if (self.ptSpeedIndex < c.CHOICES_SPEED.length) {
          self.ptSpeedIndex++;
        }
        self.ptSpeed = c.CHOICES_SPEED[self.ptSpeedIndex].id;
        self.setVariable("ptSpeedVar", self.ptSpeed);
      },
    };
  }

  // ######################
  // #### Lens Actions ####
  // ######################

  if (seriesActions.zoom) {
    actions.zoomI = {
      name: "Lens - Zoom In",
      options: [zoomdefinition],
      callback: async (action) => {
        //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

        cmd = "continuouszoommove";

        param = action.options.zoomspeed;
        //self.camstreamerMove(param, cmd, opt.speed)
        self.log("debug", "zoomspeed: " + param);

        await sendcamstreamer(self, cmd, param);
      },
    };
  }

  if (seriesActions.zoom) {
    actions.zoomO = {
      name: "Lens - Zoom Out",
      options: [zoomdefinition],
      callback: async (action) => {
        //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

        cmd = "continuouszoommove";
        param = "-" + action.options.zoomspeed;
        //self.camstreamerMove(param, cmd, opt.speed)

        await sendcamstreamer(self, cmd, param);
      },
    };
  }

  if (seriesActions.zoom) {
    actions.zoomS = {
      name: "Lens - Zoom Stop",
      options: [],
      callback: async (action) => {
        cmd = "continuouszoommove";
        param = 0;
        await sendcamstreamer(self, cmd, param);
        self.getCameraPosition();
        self.checkFeedbacks();
      },
    };
  }

  if (seriesActions.zSpeed) {
    actions.zSpeedS = {
      name: "Lens - Zoom Speed",
      options: [
        {
          type: "dropdown",
          label: "speed setting",
          id: "speed",
          default: 25,
          choices: c.CHOICES_SPEED,
        },
      ],
      callback: async (action) => {
        self.zSpeed = action.options.speed;

        const idx = c.CHOICES_SPEED.findIndex((sp) => sp.id === self.zSpeed);
        if (idx > -1) {
          self.zSpeedIndex = idx;
        }

        self.zSpeed = c.CHOICES_SPEED[self.zSpeedIndex].id;
        self.setVariable("zSpeedVar", self.zSpeed);
      },
    };
  }

  if (seriesActions.zSpeed) {
    actions.zSpeedU = {
      name: "Lens - Zoom Speed Up",
      options: [],
      callback: async (action) => {
        if (self.zSpeedIndex == 0) {
          self.zSpeedIndex = 0;
        } else if (self.zSpeedIndex > 0) {
          self.zSpeedIndex--;
        }
        self.zSpeed = c.CHOICES_SPEED[self.zSpeedIndex].id;
        self.setVariable("zSpeedVar", self.zSpeed);
      },
    };
  }

  if (seriesActions.zSpeed) {
    actions.zSpeedD = {
      name: "Lens - Zoom Speed Down",
      options: [],
      callback: async (action) => {
        if (self.zSpeedIndex == c.CHOICES_SPEED.length) {
          self.zSpeedIndex = c.CHOICES_SPEED.length;
        } else if (self.zSpeedIndex < c.CHOICES_SPEED.length) {
          self.zSpeedIndex++;
        }
        self.zSpeed = c.CHOICES_SPEED[self.zSpeedIndex].id;
        self.setVariable("zSpeedVar", self.zSpeed);
      },
    };
  }

  if (seriesActions.focus) {
    actions.focusI = {
      name: "Lens - focus In",
      options: [speeddefinition],
      callback: async (action) => {
        //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

        cmd = "continuousfocusmove";

        param = action.options.speed;
        //self.camstreamerMove(param, cmd, opt.speed)
        self.log("debug", "speed: " + param);

        await sendcamstreamer(self, cmd, param);
      },
    };
  }

  if (seriesActions.focus) {
    actions.focusO = {
      name: "Lens - focus Out",
      options: [speeddefinition],
      callback: async (action) => {
        //console.log(util.inspect(action.options, {showHidden: false, depth: null, colors: true}))

        cmd = "continuousfocusmove";
        param = "-" + action.options.speed;
        //self.camstreamerMove(param, cmd, opt.speed)

        await sendcamstreamer(self, cmd, param);
      },
    };
  }

  if (seriesActions.focus) {
    actions.focusF = {
      name: "Lens - Focus Far",
      options: [],
      callback: async (action) => {
        await sendcamstreamer(self, "F" + parseInt(50 + self.fSpeed));
      },
    };
  }

  if (seriesActions.focus) {
    actions.focusS = {
      name: "Lens - Focus Stop",
      options: [],
      callback: async (action) => {
        await sendcamstreamer(self, "F50");
      },
    };
  }

  if (seriesActions.fSpeed) {
    actions.fSpeedS = {
      name: "Lens - Focus Speed",
      options: [
        {
          type: "dropdown",
          label: "speed setting",
          id: "speed",
          default: 25,
          choices: c.CHOICES_SPEED,
        },
      ],
      callback: async (action) => {
        self.fSpeed = action.options.speed;

        const idx = c.CHOICES_SPEED.findIndex((sp) => sp.id === self.fSpeed);
        if (idx > -1) {
          self.fSpeedIndex = idx;
        }

        self.fSpeed = c.CHOICES_SPEED[self.fSpeedIndex].id;
        self.setVariable("fSpeedVar", self.fSpeed);
      },
    };
  }

  if (seriesActions.fSpeed) {
    actions.fSpeedU = {
      name: "Lens - Focus Speed Up",
      options: [],
      callback: async (action) => {
        if (self.fSpeedIndex == 0) {
          self.fSpeedIndex = 0;
        } else if (self.fSpeedIndex > 0) {
          self.fSpeedIndex--;
        }
        self.fSpeed = c.CHOICES_SPEED[self.fSpeedIndex].id;
        self.setVariable("fSpeedVar", self.fSpeed);
      },
    };
  }

  if (seriesActions.fSpeed) {
    actions.fSpeedD = {
      name: "Lens - Focus Speed Down",
      options: [],
      callback: async (action) => {
        if (self.fSpeedIndex == c.CHOICES_SPEED.length) {
          self.fSpeedIndex = c.CHOICES_SPEED.length;
        } else if (self.fSpeedIndex < c.CHOICES_SPEED.length) {
          self.fSpeedIndex++;
        }
        self.fSpeed = c.CHOICES_SPEED[self.fSpeedIndex].id;
        self.setVariable("fSpeedVar", self.fSpeed);
      },
    };
  }

  actions.focusM = {
    name: "Lens - Focus Mode (Auto Focus)",
    options: [
      {
        type: "dropdown",
        label: "Auto / Manual Focus",
        id: "bol",
        default: 0,
        choices: [
          { id: 0, label: "Auto Focus" },
          { id: 1, label: "Manual Focus" },
        ],
      },
    ],

    callback: async (action) => {
      cmd = "autofocus";
      self.log("debug", "focusparm: " + action.options.bol);
      if (action.options.bol == 0) {
        param = "on";
      } else {
        param = "off";
      }

      await sendcamstreamer(self, cmd, param);
      self.getCameraPosition();
      self.checkFeedbacks();
    },
  };

  // #########################
  // #### Presets Actions ####
  // #########################
  seriesActions.preset = true;

  if (seriesActions.preset) {
    actions.Setpreset = {
      name: "Preset - Save",
      options: [
        {
          type: "dropdown",
          label: "Preset Nr.",
          id: "val",
          default: CHOICES_PRESET[0].id,
          choices: CHOICES_PRESET,
        },
      ],
      callback: async (action) => {
        cmd = "setserverpresetno";
        param = action.options.val;
        //self.camstreamerMove(param, cmd, opt.speed)

        await sendcamstreamer(self, cmd, param);
        self.getCameraPosition();
        self.checkFeedbacks();
        await sendcamstreamer(self, "M" + action.options.val);
      },
    };
  }
  if (seriesActions.preset) {
    actions.preset = {
      name: "Preset - Recall",
      options: [
        {
          type: "dropdown",
          label: "Preset Nr.",
          id: "val",
          default: CHOICES_PRESET[0].id,
          choices: CHOICES_PRESET,
        },
      ],
      callback: async (action) => {
        cmd = "gotoserverpresetno";
        param = action.options.val;
        //self.camstreamerMove(param, cmd, opt.speed)

        await sendcamstreamer(self, cmd, param);
        self.getCameraPosition();
        self.checkFeedbacks();
      },
    };
  }

  return actions;
}
