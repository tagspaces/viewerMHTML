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
  var MailParser = require("ext/viewerMHTML/mailparser/mailparser.min").MailParser;
 
  var currentFilePath;
  var currentContent;
  var $containerElement;
  var contentIFrame;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + exports.id;

  exports.init = function(filePath, containerElementID) {
    console.log("Initalization MHTML Viewer...");
    $containerElement = $('#' + containerElementID);
    currentFilePath = filePath;

    //exports.getTextContent(filePath);

    var filePathURI;
    if (isCordova || isWeb) {
      filePathURI = filePath;
    } else {
      filePathURI = "file:///" + filePath;
    }

    $containerElement.empty();
    $containerElement.css("background-color", "white");

    var extUITmpl = Handlebars.compile(
      '<div class="flexLayoutVertical" style="width: 100%;">' +
        '<div class="btn-group" style="margin: 5px;">' +
          '<button class="btn btn-default" id="{{id}}OpenExternallyButton" title="Due security restrictions, opening of MHT(ML) files in iframes has been disabled. Use this button to open the file in a new TagSpaces window.">' +
            '<i class="fa fa-desktop"></i>&nbsp;Open in new window' +
          '</button>' +
          '<button class="btn btn-default" title="" id="{{id}}OpenURLButton">' +
            '<i class="fa fa-external-link"></i>&nbsp;Open externaly:' +
          '</button>' +
        '</div>' +
        '<p style="margin: 5px; font-size: 12px;">Preview of the document <span id="{{id}}Meta"></span></p>' +
        '<iframe id="{{id}}Viewer" sandbox="allow-same-origin allow-scripts" style="background-color: white; border: 0px;" class="flexMaxHeight" nwdisable="" nwfaketop="" src="ext/viewerMHTML/index.html"></iframe>' +
      '</div>'
      );

    var extUI = extUITmpl({
      id: exports.id
    });
    $containerElement.append(extUI);

    $("#" + exports.id + "OpenExternallyButton").click(function() {
      window.open(filePathURI, '_blank');
    });

    window.addEventListener('message', receiveMessage, false);
    contentIFrame = document.getElementById(exports.id + "Viewer");
    contentIFrame.onload = function() {
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

    var contentWindow = document.getElementById(exports.id + "Viewer").contentWindow;

    if (typeof contentWindow.setContent === "function") {
      contentWindow.MailParser = MailParser;
      contentWindow.setContent(currentContent, function(obj) {
        $("#" + exports.id + "Meta").append("saved on " + obj.headers.date);
        $("#" + exports.id + "OpenURLButton")
          .append(obj.contentLocation)
          .attr("href", obj.contentLocation)
          .show()
          .click(function() {
            TSCORE.openLinkExternally($(this).attr("href"));
          });
      });
    }
  };

  exports.getContent = function() {};

  exports.getTextContent = function(file, result) {
   
    TSCORE.IO.getFileContent(file, function(buf) {
      var mailparser = new MailParser();

      var text = TSCORE.Utils.arrayBufferToStr(buf);
      mailparser.on("end", function(parsedObject) {
        //console.log(parsedObject);
        var matched = parsedObject.html.match(/<body[^>]*>([\w|\W]*)<\/body>/im);
        console.log($(matched[1]).text());
      });

      mailparser.write(text);
      mailparser.end();
     
    }, function(err) {
      console.log(err);
    });
  };

});
