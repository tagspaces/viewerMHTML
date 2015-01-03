/* Copyright (c) 2012-2014 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that 
 * can be found in the LICENSE file. */

define(function(require, exports, module) {
"use strict";

    console.log("Loading viewerMHTML");

    exports.id = "viewerMHTML"; // ID should be equal to the directory name where the ext. is located
    exports.title = "URL Viewer";
    exports.type = "editor";
    exports.supportedFileTypes = [ "mht", "mhtml" ];

    var TSCORE = require("tscore");

    var currentFilePath;
    var currentContent;
    var $containerElement;
    var contentIFrame;

    var extensionDirectory = TSCORE.Config.getExtensionPath()+"/"+exports.id;

    exports.init = function(filePath, containerElementID) {
        console.log("Initalization MHTML Viewer...");
        $containerElement = $('#'+containerElementID);
        currentFilePath = filePath;

        $containerElement.empty();
        $containerElement.css("background-color","white");
        $containerElement.append($('<iframe>', {
            id: "iframeViewer",
            sandbox: "allow-same-origin allow-scripts",
            src: extensionDirectory+"/index.html",
            style: "background-color: white;",
            "nwdisable": "",
            "nwfaketop": ""
        }));

        //window.addEventListener('message', receiveMessage, false);

        contentIFrame = document.getElementById('iframeViewer');
        contentIFrame.onload = function() {
            //console.log("IFrame Loaded: ");
            TSCORE.IO.loadTextFile(currentFilePath);
        };
        contentIFrame.src = extensionDirectory+"/index.html";
    };

    function receiveMessage(message) {
        console.log("Message Received: ");
        var data = JSON.parse(message.data);
        switch (data.event) {
            case 'mhtmParserReady':
                TSCORE.IO.loadTextFile(currentFilePath);
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

        var bodyRegex = /\<body[^>]*\>([^]*)\<\/body/m;
        var bodyContent = undefined;

//        var titleRegex = /\<title[^>]*\>([^]*)\<\/title/m;
//        var titleContent = content.match( titleRegex )[1];

        var contentWindow = document.getElementById("iframeViewer").contentWindow;
        if(typeof contentWindow.setContent === "function") {
            contentWindow.setContent(currentContent);
        }
    };

    exports.getContent = function() {};
});