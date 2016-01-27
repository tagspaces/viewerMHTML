/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require, exports, module) {
  "use strict";

  console.log("Loading viewerMHTML");

  var extensionID = "viewerMHTML"; // ID should be equal to the directory name where the ext. is located
  var extensionSupportedFileTypes = ["mht", "mhtml"];

  var TSCORE = require("tscore");
  var MailParser = require("ext/viewerMHTML/mailparser/mailparser.min").MailParser;
 
  var currentFilePath;
  var currentContent;
  var $containerElement;
  var contentIFrame;

  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;

  function init(filePath, containerElementID) {
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
        '<iframe id="{{id}}Viewer" sandbox="allow-same-origin allow-scripts" style="background-color: white; border: 0px;" class="flexMaxHeight" nwdisable="" src="ext/viewerMHTML/index.html"></iframe>' +
      '</div>'
      );

    var extUI = extUITmpl({
      id: extensionID
    });
    $containerElement.append(extUI);

    $("#" + extensionID + "OpenExternallyButton").click(function() {
      window.open(filePathURI, '_blank');
    });

    contentIFrame = document.getElementById(extensionID + "Viewer");
    contentIFrame.onload = function() {
      TSCORE.IO.loadTextFilePromise(currentFilePath).then(exports.setContent, function(err) {
        console.warn("Error loading content...");
      });
    };
    contentIFrame.src = extensionDirectory + "/index.html";
  };

  function setFileType() {

    console.log("setFileType not supported on this extension");
  };

  function viewerMode(isViewerMode) {

    // set readonly
  };

  function setContent(content) {
    currentContent = content;

    var contentWindow = document.getElementById(extensionID + "Viewer").contentWindow;

    if (typeof contentWindow.setContent === "function") {
      contentWindow.MailParser = MailParser;
      contentWindow.setContent(currentContent, function(obj) {
        $("#" + extensionID + "Meta").append("saved on " + obj.headers.date);
        $("#" + extensionID + "OpenURLButton")
          .append(obj.contentLocation)
          .attr("href", obj.contentLocation)
          .show()
          .click(function() {
            TSCORE.openLinkExternally($(this).attr("href"));
          });
      });
    }
  };

  function getContent() {
    TSCORE.IO.getFileContentPromise(file).then(function(buf) {
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

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
  exports.setFileType = setFileType;

});
