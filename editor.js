/* Copyright (c) 2012-2015 The TagSpaces Authors. All rights reserved.
 * Use of this source code is governed by a AGPL3 license that
 * can be found in the LICENSE file. */
/* global MailParser, DOMPurify */

"use strict";

function setContent(content) {
  //console.log("MHTML Content: "+content);
  var mhtparser = new MailParser();
  mhtparser.on("end", function(mail_object) {
    //console.log("From:", mail_object.from);
    //console.log("Subject:", mail_object.subject);
    //console.log("Text body:", mail_object.text);
    //console.log("HTML body:", mail_object.html);
    //console.log("Attachments:", mail_object.attachments);

    var cleanedHTML = DOMPurify.sanitize(mail_object.html);

    $("#mhtmlViewer").html(cleanedHTML);

    // making all links open in the user default browser
    $("#mhtmlViewer").find("a").bind('click', function(e) {
      e.preventDefault();
      //window.open($(this).attr("href"),'_blank');
      //parent.postMessage("openLinkExternally",'*');
    }).css("cursor", "default");

  });

  mhtparser.write(content);
  mhtparser.end();
}
