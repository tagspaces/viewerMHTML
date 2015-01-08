function setContent(content) {
    //console.log("MHTML Content: "+content);
    var mhtparser = new MailParser;
    mhtparser.on("end", function(mail_object){
        //console.log("From:", mail_object.from);
        //console.log("Subject:", mail_object.subject);
        //console.log("Text body:", mail_object.text);
        //console.log("HTML body:", mail_object.html);
        //console.log("Attachments:", mail_object.attachments);

        var cleanedHTML = DOMPurify.sanitize(mail_object.html);

        $("#mhtmlViewer").html(cleanedHTML);

        // making all links open in the user default browser
        $("#mhtmlViewer").find( "a" ).bind('click', function(e){
            e.preventDefault();
            //$(this).hover(function() {
            //    $(this).css("cursor","default");
            //});
            //window.open($(this).attr("href"),'_blank');
            //parent.postMessage("openLinkExternally",'*');
        });

    });

    mhtparser.write(content);
    mhtparser.end();
}