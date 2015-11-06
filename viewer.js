/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global MailParser, DOMPurify */

"use strict";

function setContent(content, done) {
  //console.log("MHTML Content: "+content);
  var mhtparser = new MailParser();
  mhtparser.on("end", function(mail_object) {
    //console.log("mail_object:", mail_object);

    var m = /^content-location:(.*$)/im.exec(content); 
    mail_object.contentLocation = (m.length > 0) ?  m[1] : "not found";
    var cleanedHTML = DOMPurify.sanitize(mail_object.html);
    
    $("#mhtmlViewer").html(cleanedHTML);

    // making all links open in the user default browser
    $("#mhtmlViewer").find("a").bind('click', function(e) {
      e.preventDefault();
      var msg = { command: "openLinkExternally", link : $(this).attr("href") };
      window.parent.postMessage(JSON.stringify(msg), "*");
    }).css("cursor", "default");

    done(mail_object);

  });

  mhtparser.write(content);
  mhtparser.end();
}
