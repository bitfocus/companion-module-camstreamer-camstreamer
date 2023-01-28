import { combineRgb } from "@companion-module/base";
import util from "util";

// ##########################
// #### Define Feedbacks ####
// ##########################
export function getFeedbackDefinitions(self) {
  const feedbacks = {};

  const foregroundColor = combineRgb(255, 255, 255); // White
  const backgroundColorRed = combineRgb(255, 0, 0); // Red

  feedbacks.streamStatus = {
    type: "advanced",
    name: "Stream Status",
    description: "Indicates the Status of the stream",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [
      {
        type: "dropdown",
        label: "StreamId",

        id: "StreamId",
        choices: self.streamids,
      },
    ],

    callback: function (feedback) {
      const opt = feedback.options;
      console.log("feedback array: " + util.inspect(self.streams));
      var index = 0;
      for (var j = 1; j < self.streams.length; j++) {
        if (self.streams[j].id == opt.StreamId) {
          index = j;
          break;
        }
      }
      console.log("feedback stream" + opt.StreamId + "-" + index + "-");
      if (index > 0) {
        console.log(
          "feedback streamstatus" +
            opt.StreamId +
            "-" +
            index +
            "-" +
            self.streams[index].status
        );
        switch (self.streams[index].status) {
          case 1:
            return {
              bgcolor: combineRgb(220, 53, 69),
            };

            break;

          case 2:
            return {
              bgcolor: combineRgb(74, 144, 226),
            };

            break;
          case 3:
            return {
              fgcolor: combineRgb(0,0,0),
              bgcolor: combineRgb(40, 167, 69),
            };

            break;
          case 4:
            return {
              bgcolor: combineRgb(255, 255, 204),
            };

            break;
          case 5:
            return {
              bgcolor: combineRgb(255, 193, 7),
            };

            break;
          case 6:
            return {
              bgcolor: combineRgb(0, 0, 0),
            };

            break;
          case 7:
            return {
              bgcolor: combineRgb(108, 117, 125),
            };
        }
      }
      return false;
    },
  };

  feedbacks.MaxPanLimit = {
    type: "boolean",
    name: "PT-MaxPan Limit",
    description:
      "When the camera reaches the max pan-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var maxpan;

      maxpan = Number(self.getVariableValue("MaxPan")) - 1;

      var pan;
      pan = Number(self.getVariableValue("pan"));

      if (pan > maxpan) {
        return true;
      }

      return false;
    },
  };
  feedbacks.MinPanLimit = {
    type: "boolean",
    name: "PT-MinPan Limit",
    description:
      "When the camera reaches the min (left) pan-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var minpan;
      minpan = self.getVariableValue("MinPan") + 1;

      var pan;
      pan = self.getVariableValue("pan");

      if (pan < minpan) {
        return true;
      }

      return false;
    },
  };
  feedbacks.MinTiltLimit = {
    type: "boolean",
    name: "PT-MinTiltLimit",
    description:
      "When the camera reaches the min (under) tilt-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var min;
      min = self.getVariableValue("MinTilt") + 1;

      var pos;
      pos = self.getVariableValue("tilt");

      if (pos < min) {
        return true;
      }

      return false;
    },
  };
  feedbacks.MaxTiltLimit = {
    type: "boolean",
    name: "PT-MaxTiltLimit",
    description:
      "When the camera reaches the max (upper) tilt-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var max;

      max = self.getVariableValue("MaxTilt") - 1;

      var pos;
      pos = self.getVariableValue("tilt");

      if (pos > max) {
        return true;
      }

      return false;
    },
  };
  feedbacks.maxfocus = {
    type: "boolean",
    name: "maxfocus",
    description:
      "When the camera reaches the maxfocus-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var max;

      max = self.getVariableValue("MaxFocus") - 1;

      var pos;
      pos = self.getVariableValue("focus");

      if (pos > max) {
        return true;
      }

      return false;
    },
  };
  feedbacks.minfocus = {
    type: "boolean",
    name: "minfocus",
    description:
      "When the camera reaches the minfocus-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var max;

      min = Number(self.getVariableValue("MinFocus")) - 1;

      var pos;
      pos = Number(self.getVariableValue("focus"));

      if (pos < min) {
        return true;
      }

      return false;
    },
  };

  feedbacks.maxzoom = {
    type: "boolean",
    name: "maxzoom",
    description:
      "When the camera reaches the maxzoom-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var max;

      max = Number(self.getVariableValue("MaxZoom")) - 1;

      var pos;
      pos = self.getVariableValue("zoom");

      if (pos > max) {
        return true;
      }

      return false;
    },
  };
  feedbacks.minzoom = {
    type: "boolean",
    name: "minzoom",
    description:
      "When the camera reaches the minzoom-linit the background changes color",
    defaultStyle: {
      color: foregroundColor,
      bgcolor: backgroundColorRed,
    },
    options: [],
    callback: function () {
      var min;

      min = Number(self.getVariableValue("MinZoom")) + 1;

      var pos;
      pos = self.getVariableValue("zoom");

      if (pos < min) {
        return true;
      }

      return false;
    },
  };
  return feedbacks;
}
