/* Copyright (c) 2013-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define MailParser, DOMPurify, Readability */
/* globals marked, MailParser */

"use strict";

function setContent(content, filePathURI) {
  //console.log("MHTML Content: "+content);
  var mhtparser = new MailParser();
  mhtparser.on("end", function(mail_object) {
    //console.log("mail_object:", mail_object);

    var contLocation = /^content-location:(.*$)/im.exec(content);
    mail_object.contentLocation = (contLocation && contLocation.length > 0) ? contLocation[1] : "not found";
    var cleanedHTML = DOMPurify.sanitize(mail_object.html);

    //$("#mhtmlViewer").html(cleanedHTML);

    // making all links open in the user default browser
    $("#mhtmlViewer").find("a").bind('click', function(e) {
      e.preventDefault();
      var msg = {command: "openLinkExternally", link: $(this).attr("href")};
      window.parent.postMessage(JSON.stringify(msg), "*");
    }).css("cursor", "default");

    $("#fileMeta").append("saved on " + mail_object.headers.date);

    // View readability mode
    var documentClone = document.cloneNode(true);
    var article = new Readability(document.baseURI, documentClone).parse();

    var mhtmlViewer = document.getElementById("mhtmlViewer");
    var fontSize = 14;
    mhtmlViewer.style.fontSize = fontSize;
    $("#mhtmlViewer").html(article.content);
    mhtmlViewer.style.fontSize = fontSize;//"large";
    mhtmlViewer.style.fontFamily = "Helvetica, Arial, sans-serif";
    mhtmlViewer.style.background = "#ffffff";
    mhtmlViewer.style.color = "";

    $("#readabilityOn").on('click', function() {
      $("#mhtmlViewer").html(article.content);
      if ($("#mhtmlViewer").data('clicked', true)) {
        $("#toSerifFont").show();
        $("#toSansSerifFont").show();
        $("#increasingFontSize").show();
        $("#decreasingFontSize").show();
        $("#readabilityOff").show();
        $("#whiteBackgroundColor").show();
        $("#blackBackgroundColor").show();
        $("#sepiaBackgroundColor").show();
        $("#themeStyle").show();
        $("#readabilityFont").show();
        $("#readabilityFontSize").show();
        $("#readabilityOn").hide();
        $("#changeStyleButton").hide();
        $("#resetStyleButton").hide();
      }
    });

    $("#readabilityOff").on('click', function() {
      $("#mhtmlViewer").html(cleanedHTML);
      mhtmlViewer.style.fontSize = '';//"large";
      mhtmlViewer.style.fontFamily = "";
      mhtmlViewer.style.color = "";
      mhtmlViewer.style.background = "";
      $("#readabilityOff").hide();
      $("#toSerifFont").hide();
      $("#toSansSerifFont").hide();
      $("#increasingFontSize").hide();
      $("#decreasingFontSize").hide();
      $("#readabilityOff").hide();
      $("#whiteBackgroundColor").hide();
      $("#blackBackgroundColor").hide();
      $("#sepiaBackgroundColor").hide();
      $("#themeStyle").hide();
      $("#readabilityFont").hide();
      $("#readabilityFontSize").hide();
      $("#readabilityOn").show();
      $("#changeStyleButton").show();
      $("#resetStyleButton").show();
    });

    $("#toSansSerifFont").on('click', function(e) {
      e.stopPropagation();
      mhtmlViewer.style.fontFamily = "Helvetica, Arial, sans-serif";
      //$("#toSansSerifFont").hide();
      //$("#toSerifFont").show();
    });

    $("#toSerifFont").on('click', function(e) {
      e.stopPropagation();
      mhtmlViewer.style.fontFamily = "Georgia, Times New Roman, serif";
      //$("#toSerifFont").hide();
      //$("#toSansSerifFont").show();
    });

    $("#increasingFontSize").on('click', function(e) {
      e.stopPropagation();
      increaseFont();
    });

    $("#decreasingFontSize").on('click', function(e) {
      e.stopPropagation();
      decreaseFont();
    });

     $("#whiteBackgroundColor").on('click', function(e) {
       e.stopPropagation();
       mhtmlViewer.style.background = "#ffffff";
       mhtmlViewer.style.color = "";
     });

    $("#blackBackgroundColor").on('click', function(e) {
      e.stopPropagation();
      mhtmlViewer.style.background = "#282a36";
      mhtmlViewer.style.color = "#ffffff";
    });

    $("#sepiaBackgroundColor").on('click', function(e) {
      e.stopPropagation();
      mhtmlViewer.style.color = "#5b4636";
      mhtmlViewer.style.background = "#f4ecd8";
    });

    function increaseFont() {
      var style = window.getComputedStyle(mhtmlViewer, null).getPropertyValue('font-size');
      var fontSize = parseFloat(style);
      mhtmlViewer.style.fontSize = (fontSize + 1) + 'px';
    }

    function decreaseFont() {
      var style = window.getComputedStyle(mhtmlViewer, null).getPropertyValue('font-size');
      var fontSize = parseFloat(style);
      mhtmlViewer.style.fontSize = (fontSize - 1) + 'px';
    }

    Mousetrap.bind(['command++', 'ctrl++'], function(e) {
      increaseFont();
      return false;
    });

    Mousetrap.bind(['command+-', 'ctrl+-'], function(e) {
      decreaseFont();
      return false;
    });

    init(filePathURI, mail_object);
  });

  mhtparser.write(content);
  mhtparser.end();
}

function init(filePathURI, objectlocation) {
  var isCordova;
  var isWin;
  var isWeb;

  var $htmlContent;

  function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(window.location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var locale = getParameterByName("locale");

  var extSettings;
  loadExtSettings();

  isCordova = parent.isCordova;
  isWin = parent.isWin;
  isWeb = parent.isWeb;

  $htmlContent = $("#mhtmlViewer");

  var styles = ['', 'solarized-dark', 'github', 'metro-vibes', 'clearness', 'clearness-dark'];
  var currentStyleIndex = 0;
  if (extSettings && extSettings.styleIndex) {
    currentStyleIndex = extSettings.styleIndex;
  }

  var zoomSteps = ['zoomSmallest', 'zoomSmaller', 'zoomSmall', 'zoomDefault', 'zoomLarge', 'zoomLarger', 'zoomLargest'];
  var currentZoomState = 3;
  if (extSettings && extSettings.zoomState) {
    currentZoomState = extSettings.zoomState;
  }

  $htmlContent.removeClass();
  $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);

  $("#changeStyleButton").on('click', function() {
    currentStyleIndex = currentStyleIndex + 1;
    if (currentStyleIndex >= styles.length) {
      currentStyleIndex = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#resetStyleButton").on('click', function() {
    currentStyleIndex = 0;
    //currentZoomState = 5;
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  // Menu: hide readability items
  $("#toSansSerifFont").show();
  $("#toSerifFont").show();
  $("#increasingFontSize").show();
  $("#decreasingFontSize").show();
  $("#readabilityOn").hide();
  $("#changeStyleButton").hide();
  $("#resetStyleButton").hide();
  //$("#whiteBackgroundColor").hide();
  //$("#blackBackgroundColor").hide();
  //$("#sepiaBackgroundColor").hide();
  //$("#themeStyle").hide();
  //$("#readabilityFont").hide();
  //$("#readabilityFontSize").hide();

  //hide zoom operation menu items because they don't influence on the style
  $("#zoomInButton").hide();
  $("#zoomOutButton").hide();
  $("#zoomResetButton").hide();

  $("#zoomInButton").on('click', function() {
    //console.log("#zoomInButton click");
    currentZoomState++;
    if (currentZoomState >= zoomSteps.length) {
      currentZoomState = 6;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomOutButton").on('click', function() {
    //console.log("#zoomOutButton  click");
    currentZoomState--;
    if (currentZoomState < 0) {
      currentZoomState = 0;
    }
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });

  $("#zoomResetButton").on('click', function() {
    currentZoomState = 3;
    $htmlContent.removeClass();
    $htmlContent.addClass('markdown ' + styles[currentStyleIndex] + " " + zoomSteps[currentZoomState]);
    saveExtSettings();
  });


  $("#openInNewWindowButton").click(function() {
    window.parent.open(filePathURI, '_blank');
  });

  $("#openURLButton").click(function() {
    var msg = {command: "openLinkExternally", link: objectlocation.contentLocation.trim()};
    window.parent.postMessage(JSON.stringify(msg), "*");
  });

  // Init internationalization
  $.i18n.init({
    ns: {namespaces: ['ns.viewerMHTML']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    $('[data-i18n]').i18n();
  });

  function saveExtSettings() {
    var settings = {
      "styleIndex": currentStyleIndex,
      "zoomState": currentZoomState
    };
    localStorage.setItem('viewerMHTMLSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem("viewerMHTMLSettings"));
  }
}