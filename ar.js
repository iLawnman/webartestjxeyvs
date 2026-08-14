// ar.js — AR.js: источник, контекст, маркер Hiro + статус

var arToolkitSource, arToolkitContext, arMarkerControls;
var markerVisible = false;
var arReady = false;
var lastTime = performance.now();
var frames = 0;
var fps = 0;

function setStatus(arText, arClass, markerText, markerClass) {
  var elAr = document.getElementById('st-ar');
  var elMarker = document.getElementById('st-marker');
  if (elAr) {
    elAr.textContent = arText;
    elAr.className = 'value ' + (arClass || '');
  }
  if (elMarker) {
    elMarker.textContent = markerText;
    elMarker.className = 'value ' + (markerClass || '');
  }
}

function hideLoader() {
  var loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

function updateFps() {
  frames++;
  var now = performance.now();
  if (now - lastTime >= 1000) {
    fps = Math.round((frames * 1000) / (now - lastTime));
    frames = 0;
    lastTime = now;
    var el = document.getElementById('st-fps');
    if (el) el.textContent = fps;
  }
}

function initAR() {
  setStatus('инициализация…', 'search', '—', '');

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam',
    sourceWidth: window.innerWidth > window.innerHeight ? 1280 : 720,
    sourceHeight: window.innerWidth > window.innerHeight ? 720 : 1280
  });

  arToolkitSource.init(function onReady() {
    var video = arToolkitSource.domElement;
    if (video) {
      video.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:0!important;';
    }

    onResizeAR();
    hideLoader();
    arReady = true;
    setStatus('активен', 'ok', 'ищу…', 'search');
  });

  // Фолбэк, если колбэк не сработал
  setTimeout(function () {
    hideLoader();
    if (!arReady) {
      setStatus('камера?', 'search', 'ожидание…', 'search');
    }
  }, 4000);

  window.addEventListener('resize', function () {
    onResizeAR();
    onResize();
  });

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'camera_para.dat',
    detectionMode: 'mono',
    maxDetectionRate: 30,
    canvasWidth: 640,
    canvasHeight: 480
  });

  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: 'hiro.patt',
    changeMatrixMode: 'modelViewMatrix'
  });

  markerRoot.visible = false;
}

function onResizeAR() {
  if (!arToolkitSource) return;
  try {
    arToolkitSource.onResizeElement();
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    if (arToolkitContext && arToolkitContext.arController !== null) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
    }
  } catch (e) {}

  var video = arToolkitSource.domElement;
  if (video) {
    video.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:100%!important;height:100%!important;object-fit:cover!important;z-index:0!important;';
  }
}

function updateAR() {
  if (!arToolkitSource || arToolkitSource.ready === false) return;

  arToolkitContext.update(arToolkitSource.domElement);

  var visible = markerRoot.visible === true;

  if (visible !== markerVisible) {
    markerVisible = visible;
    if (markerVisible) {
      setStatus('активен', 'ok', 'найден ✓', 'ok');
    } else {
      setStatus('активен', 'ok', 'ищу…', 'search');
    }
  }
}

// ===== Запуск =====
initThree();
initAR();

function animate() {
  requestAnimationFrame(animate);
  updateAR();
  updateFps();
  render();
}
animate();
