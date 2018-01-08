/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* global define MailParser, DOMPurify, Readability */
/* globals marked, MailParser, Mousetrap */

"use strict";
sendMessageToHost({ command: 'loadDefaultTextContent' });

var readabilityContent;
var cleanedHTML;
var mhtmlViewer;
var fontSize = 14;

function setContent(content, filePathURI) {
  //console.log("MHTML Content: "+content);
  var mhtparser = new mailparser.MailParser();
  mhtparser.on("end", function(mail_object) {
    //console.log("mail_object:", mail_object);

    var contLocation = /^content-location:(.*$)/im.exec(content);
    mail_object.contentLocation = (contLocation && contLocation.length > 0) ? contLocation[1] : "not found";
    cleanedHTML = DOMPurify.sanitize(mail_object.html);

    updateHTMLContent($("#mhtmlViewer"), cleanedHTML);

    $("#fileMeta").append("saved on " + mail_object.headers.date);

    // View readability mode

    try {
      var documentClone = document.cloneNode(true);
      var article = new Readability(document.baseURI, documentClone).parse();
      readabilityContent = article.content;
    } catch (e) {
      console.log("Error handling" + e);
      var msg = {
        command: "showAlertDialog",
        title: 'Readability Mode',
        message: 'This content can not be loaded.'
      };
      sendMessageToHost(msg);
    }


    if(readabilityContent) {
      updateHTMLContent($("#mhtmlViewer"), readabilityContent);
    }

    mhtmlViewer = document.getElementById("mhtmlViewer");
    mhtmlViewer.style.fontSize = fontSize;//"large";
    mhtmlViewer.style.fontFamily = "Helvetica, Arial, sans-serif";
    mhtmlViewer.style.background = "#ffffff";
    mhtmlViewer.style.color = "";

    init(filePathURI, mail_object);
  });

  mhtparser.write(content);
  mhtparser.end();
}

function handleLinks($element) {
  $element.find("a[href]").each(function() {
    var currentSrc = $(this).attr("href");
    $(this).off();
    $(this).on('click', function(e) {
      e.preventDefault();
      var msg = {command: "openLinkExternally", link: currentSrc};
      sendMessageToHost(msg);
    });
  });
}

function updateHTMLContent($targetElement, content) {
  $targetElement.html(content);
  handleLinks($targetElement);
}

var isWeb = (document.URL.startsWith('http') && !document.URL.startsWith('http://localhost:1212/'));

function init(filePathURI, objectlocation) {
  var isCordova;
  var isWin;

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

  // isCordova = parent.isCordova;
  // isWin = parent.isWin;

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

  // Menu: hide readability items
  $("#toSansSerifFont").show();
  $("#toSerifFont").show();
  $("#increasingFontSize").show();
  $("#decreasingFontSize").show();
  $("#readabilityOn").hide();
  $("#changeStyleButton").hide();
  $("#resetStyleButton").hide();

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

  $("#openInNewWindowButton").on('click', function() {
    window.parent.open(filePathURI, '_blank'); // , 'nodeIntegration=0'
  });

  $("#openURLButton").on('click', function() {
    var msg = {command: "openLinkExternally", link: objectlocation.contentLocation.trim()};
    sendMessageToHost(msg);
  });

  $("#toSansSerifFont").on('click', function(e) {
    e.stopPropagation();
    $htmlContent[0].style.fontFamily = "Helvetica, Arial, sans-serif";
  });

  $("#toSerifFont").on('click', function(e) {
    e.stopPropagation();
    $htmlContent[0].style.fontFamily = "Georgia, Times New Roman, serif";
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
    $htmlContent[0].style.background = "#ffffff";
    $htmlContent[0].style.color = "";
  });

  $("#blackBackgroundColor").on('click', function(e) {
    e.stopPropagation();
    $htmlContent[0].style.background = "#282a36";
    $htmlContent[0].style.color = "#ffffff";
  });

  $("#sepiaBackgroundColor").on('click', function(e) {
    e.stopPropagation();
    $htmlContent[0].style.color = "#5b4636";
    $htmlContent[0].style.background = "#f4ecd8";
  });

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

  $("#readabilityOn").on('click', function() {
    if(readabilityContent) {
      updateHTMLContent($("#mhtmlViewer"), readabilityContent);
    }
    //if ($("#mhtmlViewer").data('clicked', true)) {
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
    //}
  });

  $("#readabilityOff").on('click', function() {
    updateHTMLContent($("#mhtmlViewer"), cleanedHTML);
    mhtmlViewer.style.fontSize = '';
    mhtmlViewer.style.fontFamily = "";
    mhtmlViewer.style.color = "";
    mhtmlViewer.style.background = "";
    $("#readabilityOff").hide();
    $("#toSerifFont").hide();
    $("#toSansSerifFont").hide();
    $("#increasingFontSize").hide();
    $("#decreasingFontSize").hide();
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

  function increaseFont() {
    var style = window.getComputedStyle($htmlContent[0], null).getPropertyValue('font-size');
    var fontSize = parseFloat(style);
    $htmlContent[0].style.fontSize = (fontSize + 1) + 'px';
  }

  function decreaseFont() {
    var style = window.getComputedStyle($htmlContent[0], null).getPropertyValue('font-size');
    var fontSize = parseFloat(style);
    $htmlContent[0].style.fontSize = (fontSize - 1) + 'px';
  }

  Mousetrap.bind(['command++', 'ctrl++'], function(e) {
    increaseFont();
    return false;
  });

  Mousetrap.bind(['command+-', 'ctrl+-'], function(e) {
    decreaseFont();
    return false;
  });

  // Init internationalization
  i18next.init({
    ns: {namespaces: ['ns.viewerMHTML']},
    debug: true,
    lng: locale,
    fallbackLng: 'en_US'
  }, function() {
    jqueryI18next.init(i18next, $);
    $('[data-i18n]').localize();
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
