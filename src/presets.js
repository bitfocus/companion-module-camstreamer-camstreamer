import { combineRgb } from "@companion-module/base";
import util from "util";
import { icons } from "./icons.js";

export function getPresetDefinitions(self) {
  const presets = {};

  const foregroundColor = combineRgb(255, 255, 255); // White
  const backgroundColorRed = combineRgb(255, 0, 0); // Red
  self.log("debug", "presets: " + self.streams.length + ":") +
    self.overlays.length;

  if (self.streams.length > 0) {
    for (var j = 0; j < self.streams.length - 1; j++) {
      self.log("debug", "preset " + j + ": " + util.inspect(self.streamids[j]));
      presets["START" + self.streamids[j].id] = {
        type: "button",
        category: "Start/Stop",
        label: "Start " + self.streamids[j].id,
        name: "Start " + self.streamids[j].id,
        style: {
          text: "START\\n" + self.streamids[j].id,
          size: "18",
          color: 16777215,
          bgcolor: combineRgb(0, 0, 0),
        },
        steps: [
          {
            down: [
              {
                actionId: "startstream",
                options: {
                  StreamId: self.streamids[j].id,
                },
              },
            ],
          },
        ],
        feedbacks: [
            {feedbackId: "streamStatus" ,
            options: {
              StreamId: self.streamids[j].id,
            },
            style: {
              color: foregroundColor,
              bgcolor: backgroundColorRed,
            },
          },
        ],
      };
      presets["STOP" + self.streamids[j].id] = {
        type: "button",
        category: "Start/Stop",
        label: "Stop " + self.streamids[j].id,
        name: "Stop " + self.streamids[j].id,
        style: {
          text: "STOP\\n" + self.streamids[j].id,
          size: "18",
          color: 16777215,
          bgcolor: combineRgb(0, 0, 0),
        },
        steps: [
          {
            down: [
              {
                actionId: "stopstream",
                options: {
                  StreamId: self.streamids[j].id,
                },
              },
            ],
          },
        ],
        feedbacks: [
          {
            feedbackId: "streamStatus" ,
            options: {
              StreamId: self.streamids[j].id,
            },
            style: {
              color: foregroundColor,
              bgcolor: backgroundColorRed,
            },
          },
        ],
      };
    }
  }
  if (self.overlays.length > 0) {
    self.overlays.forEach((camoverlay, index, array) => {
      if (camoverlay.id > 0) {
        self.log(
          "debug",
          "preset overlay " +
            ": " +
            util.inspect(camoverlay) +
            ": " +
            camoverlay.id
        );
        presets["ENABLE" + camoverlay.id] = {
          type: "button",
          category: "Overlays",
          label: "Enable " + camoverlay.id,
          name: "Enable " + camoverlay.id,
          style: {
            text: "ENABLE\\n" + camoverlay.id,
            size: "auto",
            color: 16777215,
            bgcolor: combineRgb(0, 0, 0),
          },
          steps: [
            {
              down: [
                {
                  actionId: "enableOverlay",
                  options: {
                    OverlayId: camoverlay.id,
                  },
                },
              ],
            },
          ],
          feedbacks: [
            {
              feedbackId: "Overlaystatus",
              style: {
                color: foregroundColor,
                bgcolor: backgroundColorRed,
              },
            },
          ],
        };
        presets["DISABLE" + camoverlay.id] = {
          type: "button",
          category: "Overlays",
          label: "Disable " + camoverlay.id,
          name: "Disble " + camoverlay.id,
          style: {
            text: "DISABLE\\n" + camoverlay.id,
            size: "auto",
            color: 16777215,
            bgcolor: combineRgb(0, 0, 0),
          },
          steps: [
            {
              down: [
                {
                  actionId: "disableOverlay",
                  options: {
                    OverlayId: camoverlay.id,
                  },
                },
              ],
            },
          ],
          feedbacks: [
            {
              feedbackId: "Overlaystatus",
              style: {
                color: foregroundColor,
                bgcolor: backgroundColorRed,
              },
            },
          ],
        };
      }
    });
  }

  return presets;
}
