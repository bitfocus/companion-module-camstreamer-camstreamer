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
   //   console.log("feedback array: " + util.inspect(self.streams));
      var index = 0;
      for (var j = 1; j < self.streams.length; j++) {
        if (self.streams[j].id == opt.StreamId) {
          index = j;
          break;
        }
      }
   //   console.log("feedback stream" + opt.StreamId + "-" + index + "-");
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

 
  return feedbacks;
}
