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

  getstreams() {
    const urllib = new HttpClient();

    let url =
      this.config.host +
      ":" +
      this.config.httpPort +
      "/local/camstreamer/stream/list.cgi?action=get";
    console.log("camstreamer url: " + url);

    urllib
      .request(
        this.config.host +
          ":" +
          this.config.httpPort +
          "/local/camstreamer/stream/list.cgi?action=get",
        this.config.authtext
      )
      .then((result) => {
        if (result.status == "200") {
          console.log("processing streams");
          var resObj = result.data;
          this.camstreamer_enabled = true;
          this.processStreamInformation(this,resObj);
          this.updateStatus(InstanceStatus.Ok);
          this.getstreamstatus(this);
        } else {
          //this.updateStatus(InstanceStatus.ConnectionFailure);
          this.updateStatus(InstanceStatus.Ok);
          this.camstreamer_enabled = false;
          this.log(
            "debug",
            "Error Camstreamer Connection: " +
              resObj +
              "streamerstatus: " +
              this.camoverlay_enabled
          );
        }
      })
      .catch((err) => {
        this.log("debug", "camstreamer Error: " + util.inspect(err));
      //  this.updateStatus(InstanceStatus.ConnectionFailure);
    
      });
  }

  processStreamInformation(self,data) {
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
    self.init_actions();
    self.init_presets();
    self.init_variables();
    self.init_feedbacks();
    self.checkFeedbacks();
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
        if (result.status == "200") {
          var resObj = result.data;

          self.updateStatus(InstanceStatus.Ok);
          self.log("debug", "CamOverlay Connection: " + resObj);
          self.camoverlay_enabled = true;
          self.processOverlayInformation(self,resObj);
        } else {
          self.updateStatus(InstanceStatus.Ok);
          self.camoverlay_enabled = false;
        }
      })
      .catch((err) => {
        self.log("debug", "camsoverlay Error: " + util.inspect(err));
        self.updateStatus(InstanceStatus.ConnectionFailure);
      });
    var a = 1;
  }

  processOverlayInformation(self,data) {
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
    urllib
      .request(
        self.config.host +
          ":" +
          self.config.httpPort +
          "/local/camstreamer/api/ws_authorization.cgi",
        self.config.authtext
      )
      .then((result) => {
        console.log("debug+streamstatus result:" + util.inspect(result));
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
                    self.streams[j].active = jsonmessage.data.active.toString();
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
          });
          let aa = {};
          aa.authorization = self.authtoken;

          //console.log("ws auth ws" + util.inspect(aa));
          ws.send(JSON.stringify(aa));
          const msg = { command: "sendInitData" };
          ws.send(JSON.stringify(msg));
          //console.log("ws Client init" + msg);

          ws.on("close", function () {
            console.log("ws closed");
          });

          ws.on("connectFailed", function (error) {
            console.log("ws Connect Error: " + error.toString());
          });

          ws.on("error", function (error) {
            console.log("ws Connection error: " + error.toString());
          });
         //self.keepAlive(ws);
        });
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
    if (webSocket.readyState== webSocket.OPEN) {
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
      this.config.authtext = { digestAuth: `root:werken` };
    } else {
      this.config.authtext = { auth: `root:werken` };
    }

    this.config.host = this.config.host || "";
    this.config.httpPort = this.config.httpPort || 80;
    this.config.tcpPort = this.config.tcpPort || 31004;

    this.config.authmethod = this.config.authmethod || 0;

   // this.updateStatus(InstanceStatus.Connecting);

    this.getstreams();
    this.getoverlays(this);
    const interval = setInterval(function() {
      console.log('repeater')
      this.getstreamstatus(this)
      this.checkFeedbacks();
    }, 5000);
   
   clearInterval(interval)
    //  this.getstreamstatus();
    // this.init_actions(); // export actions

    this.checkFeedbacks();
  }
  // Update module after a config change
  async configUpdated(config) {
    this.config = config;
    this.updateStatus(InstanceStatus.Connecting);
    if (Number(this.config.authmethod) == 1) {
      this.config.authtext = {
        digestAuth: this.config.user + ":" + this.config.password,
      };
    } else {
      this.config.authtext = {
        auth: this.config.user + ":" + this.config.password,
      };
    }

    this.init_actions();
    this.init_presets();
    this.init_variables();
    this.init_feedbacks();
    this.checkFeedbacks();
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
