/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerMHTML");

  exports.id = "viewerMHTML"; // ID should be equal to the directory name where the ext. is located
  exports.title = "URL Viewer";
  exports.type = "editor";
  exports.supportedFileTypes = ["mht", "mhtml"];

  var TSCORE = require("tscore");

  var currentFilePath;
  var currentContent;
  var $containerElement;
  var contentIFrame;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization MHTML Viewer...");
    $containerElement = $('#' + containerElementID);
    currentFilePath = filePath;

    var filePathURI;
    if (isCordova || isWeb) {
      filePathURI = filePath;
    } else {
      filePathURI = "file:///" + filePath;
    }

    $containerElement.empty();
    $containerElement.css("background-color", "white");

    //$containerElement.;

    $containerElement.append($('<div>', {
      class: "alert alert-info",
      style: "margin: 5px; font-size: 14px;",
      text: "Due to security restrictions, opening of MHT files natively has been disabled. Press"
    }).append($('<button>', {
      class: "btn btn-primary",
      style: "margin: 5px;",
      text: "Open in new window"
    }).click(function() {
      window.open(filePathURI, '_blank');
    })).append("to open the document in a new window. Bellow you will find a preview of the document."));

    $containerElement.append($('<iframe>', {
      id: "iframeViewer",
      sandbox: "allow-same-origin allow-scripts",
      style: "background-color: white;",
      "nwdisable": "",
      "nwfaketop": ""
    }));

    window.addEventListener('message', receiveMessage, false);

    contentIFrame = document.getElementById('iframeViewer');
    contentIFrame.onload = function() {
      //console.log("IFrame Loaded: ");
      TSCORE.IO.loadTextFile(currentFilePath);
    };
    contentIFrame.src = extensionDirectory + "/index.html";
  };

  function receiveMessage(message) {
    alert(message);
    console.log("Message Received: ");
    var data = JSON.parse(message.data);
    switch (data.event) {
      case 'openLinkExternally':
        //TSCORE.openLinkExternally($(this).attr("href"));
        break;
    }
  }

  exports.setFileType = function() {
    console.log("setFileType not supported on this extension");
  };

  exports.viewerMode = function(isViewerMode) {
    // set readonly
  };

  exports.setContent = function(content) {
    currentContent = content;

    var contentWindow = document.getElementById("iframeViewer").contentWindow;

    if (typeof contentWindow.setContent === "function") {
      contentWindow.setContent(currentContent);
    }
  };

  exports.getContent = function() {};
});
