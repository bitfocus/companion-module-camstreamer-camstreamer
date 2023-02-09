import {
  runEntrypoint,
  InstanceBase,
  InstanceStatus,
} from "@companion-module/base";

import { UpgradeScripts } from "./upgrades.js";
import { getActionDefinitions } from "./actions.js";
import { getFeedbackDefinitions } from "./feedbacks.js";
import { getPresetDefinitions } from "./presets.js";
import { setVariables, checkVariables } from "./variables.js";
import { ConfigFields } from "./config.js";
import { WebSocket } from "ws";
import util from "util";
import { HttpClient } from "urllib";

// ########################
// #### Instance setup ####
// ########################
class camstreamercamstreamerInstance extends InstanceBase {
  streams = [{}];
  streamids = [];
  overlays = [{}];
  overlayids = [];
  camstreamer_enabled = false;
  camoverlay_enabled = false;
  ws_auth = "";
  autstr = {};

 getstreams(self) {
    const urllib = new HttpClient();
    self.camstreamer_enabled = false;

    let url =
      self.config.host +
      ":" +
      self.config.httpPort +
      "/local/camstreamer/stream/list.cgi?action=get";
    console.log("camstreamer url: " + url);

    urllib
      .request(
        self.config.host +
          ":" +
          self.config.httpPort +
          "/local/camstreamer/stream/list.cgi?action=get",
        self.config.authtext
      )
      .then((result) => {
        // console.log("processing streams"+result.status);
        if (result.status == "200") {
          var resObj = result.data;
          self.camstreamer_enabled = true;
          self.processStreamInformation(self, resObj);
          self.updateStatus(InstanceStatus.Ok);
          self.getstreamstatus(self);
          console.log("camstreamer_streams : " + util.inspect(self.streamids));
        } else {
          //   console.log(
          //    "processing streams error" +
          //     "RESULT:" +
          //      result.status +
          //      "inspect:" +
          //      util.inspect(result)
          //  );
          //self.updateStatus(InstanceStatus.ConnectionFailure);
          self.updateStatus(InstanceStatus.ConnectionFailure);
          self.camstreamer_enabled = false;
          //self.log(
          //  "debug",
          //  "Error Camstreamer Connection: " +
          //   resObj +
          //   "streamerstatus: " +
          //   self.camoverlay_enabled
          //);
        }
      })
      .catch((err) => {
        console.log("camstreamer Error: " + util.inspect(err));
        self.updateStatus(InstanceStatus.ConnectionFailure);
        self.camstreamer_enabled = false;
      });
  }

  processStreamInformation(self, data) {
    const msg = JSON.parse(data);
    let resultObj = JSON.parse(data);
    let a = resultObj.data[0];
    var camstream = {};
    var value = {};
    var i = 0;
    var streamid = 0;
    for (let key in resultObj.data) {
      let camstream = resultObj.data[key];
      //we must add the key to the object as this is not part of the properties returned
      camstream.id = key;
      camstream.status = 7;
      camstream.isStreaming = "0";
      camstream.automationState = "0";
      let members = Object.keys(camstream).length;
      self.streams.push(camstream);
      const ids = { id: key, label: "stream: " + key };
      self.streamids.push(ids);
    }
   
   
  }

  getoverlays(self) {
    const urllib = new HttpClient();
    urllib
      .request(
        self.config.host +
          ":" +
          self.config.httpPort +
          "/local/camoverlay/api/services.cgi?action=get",
        self.config.authtext
      )
      .then((result) => {
        console.log("processing overlays"+result.status);
        if (result.status == "200") {
          var resObj = result.data;

          self.updateStatus(InstanceStatus.Ok);
          self.log("debug", "CamOverlay Connection: " + resObj);
          self.camoverlay_enabled = true;
          self.processOverlayInformation(self, resObj);
        } else {
          self.updateStatus(InstanceStatus.ConnectionFailure);
          self.camoverlay_enabled = false;
        }
      })
      .catch((err) => {
        console.log("camsoverlay Error: " + util.inspect(err));
        self.updateStatus(InstanceStatus.ConnectionFailure);
      });
    var a = 1;
  }

  processOverlayInformation(self, data) {
    const msg = JSON.parse(data);
    let resultObj = JSON.parse(data);
    //  self.log("debug", "data overlay s: " + util.inspect(resultObj.services));
    var camoverlay = {};
    resultObj.services.forEach((camoverlay, index, array) => {
      let members = Object.keys(camoverlay).length;
      self.overlays.push(camoverlay);
      const ids = { id: camoverlay.id, label: "overlay: " + camoverlay.id };
      self.overlayids.push(ids);
    });

    self.init_actions();
    self.init_presets();
    self.init_variables();
    self.init_feedbacks();

    self.checkFeedbacks();
    if (String(resultObj).includes("401 Unauthorized")) {
      self.updateStatus(InstanceStatus.ConnectionFailure);
    } else {
      self.updateStatus(InstanceStatus.Ok);
    }
  }

  getstreamstatus(self) {
    const urllib = new HttpClient();
    // get token
    urllib
      .request(
        self.config.host +
          ":" +
          self.config.httpPort +
          "/local/camstreamer/api/ws_authorization.cgi",
        self.config.authtext
      )
      .then((result) => {
    //    console.log("debug+streamstatus result:" + util.inspect(result));
        if (result.status == "200") {
          var resObj = JSON.parse(result.data);
          self.authtoken = resObj.data;
          // console.log("debug", "ws auth org:" + self.authtoken);

          // console.log("ws Client connecting");
          // self.processOverlayInformation(resObj);
          const wsurl =
            "ws://" +
            self.config.host +
            ":" +
            self.config.httpPort +
            "/local/camstreamer/events";
          const ws = new WebSocket(wsurl, "events");
          //     ws._socket.setKeepAlive(true,100)

          ws.on("open", function open() {
            console.log("ws streamstatus Client connected");
            ws.on("message", function (mess) {
              console.log(
                " received a message : " + util.inspect(JSON.parse(mess))
              );
              let jsonmessage = JSON.parse(mess);
              console.log(
                " received a message json: " + util.inspect(jsonmessage)
              );

              if (mess.toString().includes("StreamState")) {
                //  console.log("message type:" + util.inspect(jsonmessage));

                if (self.streams.length > 0) {
                  for (var l = 0; l < self.streams.length; l++) {
                    let j = l;
                    if (self.streams[j].id == jsonmessage.data.streamID) {
                      self.streams[j].enabled =
                        jsonmessage.data.enabled.toString();
                      self.streams[j].active =
                        jsonmessage.data.active.toString();
                      self.streams[j].automationState =
                        jsonmessage.data.automationState.toString();
                      self.streams[j].isStreaming =
                        jsonmessage.data.isStreaming.toString();
                    }
                  }
                }
              }
              if (self.streams.length > 0) {
                for (var l = 1; l < self.streams.length; l++) {
                  let j = l;

                  if (
                    self.streams[j].enabled == "0" &&
                    self.streams[j].active == "1" &&
                    self.streams[j].isStreaming == "0"
                  ) {
                    self.streams[j].status = 1;
                  }
                  if (
                    self.streams[j].enabled == "1" &&
                    self.streams[j].active == "1" &&
                    self.streams[j].isStreaming == "0" &&
                    self.streams[j].automationState == "0"
                  ) {
                    self.streams[j].status = 2;
                  }
                  if (
                    self.streams[j].enabled == "1" &&
                    self.streams[j].active == "1" &&
                    self.streams[j].isStreaming == "1" &&
                    self.streams[j].automationState == "1"
                  ) {
                    self.streams[j].status = 3;
                  }
                  if (
                    self.streams[j].enabled == "1" &&
                    self.streams[j].active == "0" &&
                    self.streams[j].isStreaming == "0" &&
                    self.streams[j].automationState == "0"
                  ) {
                    self.streams[j].status = 4;
                  }
                  if (
                    self.streams[j].enabled == "1" &&
                    self.streams[j].active == "1" &&
                    self.streams[j].isStreaming == "0" &&
                    self.streams[j].automationState == "1"
                  ) {
                    self.streams[j].status = 5;
                  }
                }
              }

              self.checkFeedbacks();
              //  console.log("streamsarray: " + util.inspect(self.streams));

              let aa = {};
              aa.authorization = self.authtoken;
              const wse = new WebSocket(wsurl, "events");
              wse.on("open", function open() {
                //console.log("ws auth ws" + util.inspect(aa));
                wse.send(JSON.stringify(aa));
                const msg = { command: "sendInitData" };
                wse.send(JSON.stringify(msg));
                console.log("wse Client init" + util.inspect(msg));

                wse.on("close", function () {
                  console.log("ws closed");
                });

                wse.on("connectFailed", function (error) {
                  console.log("ws Connect Error: " + error.toString());
                });

                wse.on("error", function (error) {
                  console.log("ws Connection error: " + error.toString());
                  self.updateStatus(InstanceStatus.ConnectionFailure);
                  self.camstreamer_enabled = false;
                });
                //self.keepAlive(ws);
              });
            });
          });
        } else {
          self.log("debug", "camsstatusError: " + util.inspect(result));
          self.updateStatus(InstanceStatus.ConnectionFailure);
        }
      })
      .catch((err) => {
        self.log("debug", "camsstatusError: " + util.inspect(err));
        self.updateStatus(InstanceStatus.ConnectionFailure);
      });

    // console.log(" token : " + self.authtoken);
  }

  timerID = 0;
  keepAlive(webSocket) {
    var timeout = 20000;
    if (webSocket.readyState == webSocket.OPEN) {
      webSocket.send("");
    }
    this.timerId = setTimeout(this.keepAlive, timeout);
  }
  cancelKeepAlive() {
    if (timerId) {
      clearTimeout(this.timerId);
    }
  }

  // When module gets deleted
  async destroy() {
    // Remove TCP Server and close all connections
  }
  // Initalize module
  async init(config) {
    this.config = config;

    if (Number(this.config.authmethod) == 1) {
      this.config.authtext = {
        digestAuth: `${this.config.user}:${this.config.password}`,
      };
    } else {
      this.config.authtext = {
        auth: `${this.config.user}:${this.config.password}`,
      };
    }

    this.config.host = this.config.host || "";
    this.config.httpPort = this.config.httpPort || 80;
    this.config.tcpPort = this.config.tcpPort || 31004;

    this.config.authmethod = this.config.authmethod || 0;


    this.updateStatus(InstanceStatus.Connecting);
    console.log(
      "debug",
      "authentication: " + util.inspect(this.config.authtext)
    );
  this.streams.length = 0; 
  this.streamids.length = 0;
  this.overlays.length=0;
  this.overlayids.length=0;
    await this.getstreams(this);
    console.log("camstreamer_enabled : " + util.inspect(this.streamids));
 //  if (this.camstreamer_enabled) 
// if (this.streamids.length > 0)
    {
      this.getoverlays(this);
      this.init_actions();
      this.init_presets();
      this.init_variables();
      this.init_feedbacks();
     
      const interval = setInterval(function () {
        console.log("repeater");
        this.getstreamstatus(this);
        this.checkFeedbacks();
      }, 5000);

      clearInterval(interval);
      //  this.getstreamstatus();
      // this.init_actions(); // export actions

      this.checkFeedbacks(this);
    }
  }
  // Update module after a config change
  async configUpdated(config) {
    this.config = config;

    if (Number(this.config.authmethod) == 1) {
      this.config.authtext = {
        digestAuth: `${this.config.user}:${this.config.password}`,
      };
    } else {
      this.config.authtext = {
        auth: `${this.config.user}:${this.config.password}`,
      };
    }

    this.config.host = this.config.host || "";
    this.config.httpPort = this.config.httpPort || 80;
    this.config.tcpPort = this.config.tcpPort || 31004;

    this.config.authmethod = this.config.authmethod || 0;

    this.updateStatus(InstanceStatus.Connecting);
    console.log(
      "debug",
      "authentication: " + util.inspect(this.config.authtext)
    );
    this.streams.length = 0; 
    this.streamids.length = 0;
    this.overlays.length=0;
    this.overlayids.length=0;
    this.getstreams(this);
    console.log("connectresult: " + this.camstreamer_enabled);
  //  if (this.camstreamer_enabled == true) 
    {
      this.getoverlays(this);
      this.init_actions();
      this.init_presets();
      this.init_variables();
      this.init_feedbacks();
      const interval = setInterval(function () {
        console.log("repeater");
        this.getstreamstatus(this);
        this.checkFeedbacks();
      }, 5000);

      clearInterval(interval);
      //  this.getstreamstatus();
      // this.init_actions(); // export actions

      this.checkFeedbacks(this);
    }
  }

  // Return config fields for web config
  getConfigFields() {
    return ConfigFields;
  }

  // ##########################
  // #### Instance Presets ####
  // ##########################
  init_presets() {
    this.setPresetDefinitions(getPresetDefinitions(this));
  }
  // ############################
  // #### Instance Variables ####
  // ############################
  init_variables() {
    this.setVariableDefinitions(setVariables(this));
  }
  // Setup Initial Values
  checkVariables() {
    checkVariables(this);
  }
  // ############################
  // #### Instance Feedbacks ####
  // ############################
  init_feedbacks() {
    this.setFeedbackDefinitions(getFeedbackDefinitions(this));
  }

  init_actions() {
    this.setActionDefinitions(getActionDefinitions(this));
  }
}

runEntrypoint(camstreamercamstreamerInstance, UpgradeScripts);
