/*
 * CutJS
 * Copyright (c) 2013-2014 Ali Shakiba, Piqnt LLC and other contributors
 * Available under the MIT license
 * @license
 */

if (typeof Cut === 'undefined' && typeof require === 'function')
  var Cut = require('./cut-core');

DEBUG = typeof DEBUG === 'undefined' || DEBUG;

/**
 * Cordova/PhoneGap FastCanvas plugin loader.
 */

Cut.config({
  'app-loader' : AppLoader,
  'image-loader' : ImageLoader,
});

if (typeof FastCanvas === 'undefined') {
  FastCanvas = window.FastCanvas;
}

FASTCANVAS_FALLBACK = typeof FASTCANVAS_FALLBACK !== 'undefined'
    && FASTCANVAS_FALLBACK;

window.addEventListener('load', function() {
  DEBUG && console.log('On load.');
  // device ready not called; must be in a browser
  // var readyTimeout = setTimeout(function() {
  // DEBUG && console.log('On deviceready timeout.');
  // Cut.start();
  // }, 2000);

  document.addEventListener('deviceready', function() {
    DEBUG && console.log('On deviceready.');
    // clearTimeout(readyTimeout);

    // So that image loader can be used before app loader.
    FastCanvas.create(FASTCANVAS_FALLBACK);
    console.log('FastCanvas: ' + FastCanvas.isFast);

    Cut.start();
  }, false);

  document.addEventListener('pause', function() {
    Cut.pause();
  }, false);

  document.addEventListener('resume', function() {
    Cut.resume();
  }, false);
}, false);

function AppLoader(app, configs) {
  configs = configs || {};
  var canvas = configs.canvas, context = null, full = true;
  var width = 0, height = 0, ratio = 1;

  canvas = FastCanvas.create(FASTCANVAS_FALLBACK);
  console.log('FastCanvas: ' + FastCanvas.isFast);

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas) {
    canvas = document.getElementById('cutjs');
  }

  if (!canvas) {
    full = true;
    DEBUG && console.log('Creating element...');
    canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    var body = document.body;
    body.insertBefore(canvas, body.firstChild);
  }

  context = canvas.getContext('2d');

  var devicePixelRatio = window.devicePixelRatio || 1;
  var backingStoreRatio = context.webkitBackingStorePixelRatio
      || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio
      || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
  ratio = devicePixelRatio / backingStoreRatio;

  var requestAnimationFrame = window.requestAnimationFrame
      || window.msRequestAnimationFrame || window.mozRequestAnimationFrame
      || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame
      || function(callback) {
        return window.setTimeout(callback, 1000 / 60);
      };

  DEBUG && console.log('Creating root...');
  var root = Cut.root(requestAnimationFrame, function() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    this.render(context);
    FastCanvas.render();
  });

  app(root, document);

  resize();
  window.addEventListener('resize', resize, false);

  function resize() {

    if (full) {
      width = (window.innerWidth > 0 ? window.innerWidth : screen.width);
      height = (window.innerHeight > 0 ? window.innerHeight : screen.height);

      if (!FastCanvas.isFast) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }
    } else {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    }

    width *= ratio;
    height *= ratio;

    if (!FastCanvas.isFast) {
      canvas.width = width;
      canvas.height = height;
    }

    DEBUG && console.log('Resize: ' + width + ' x ' + height + ' / ' + ratio);

    root.resize(width, height, ratio);
  }

  return root;
}

function ImageLoader(src, handleComplete, handleError) {
  var image = FastCanvas.createImage();
  DEBUG && console.log('Loading image: ' + src + ' #' + image.id);
  image.onload = handleComplete;
  image.onerror = handleError;
  image.src = src;
  return image;
}

// FastCanvas workaround
(function(nop) {
  document.addEventListener('click', nop);
  document.addEventListener('mousedown', nop);
  document.addEventListener('mouseup', nop);
  document.addEventListener('touchstart', nop);
  document.addEventListener('touchend', nop);
  document.addEventListener('touchcancel', nop);
})(function() {
});
