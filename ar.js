// ar.js — AR.js: источник, контекст, маркер Hiro + статус

var arToolkitSource, arToolkitContext, arMarkerControls;
var markerVisible = false;
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
  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam',
    sourceWidth: window.innerWidth > window.innerHeight ? 1280 : 720,
    sourceHeight: window.innerWidth > window.innerHeight ? 720 : 1280
  });

  arToolkitSource.init(function onReady() {
    // Делаем видео на весь экран
    var video = arToolkitSource.domElement;
    if (video) {
      video.style.position = 'fixed';
      video.style.top = '0';
      video.style.left = '0';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.zIndex = '0';
    }

    onResizeAR();
    var loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
    setStatus('активен', 'ok', 'ищу…', 'search');
  });

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

  // Маркер Hiro
  arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: 'hiro.patt',
    changeMatrixMode: 'modelViewMatrix'
  });
}

function onResizeAR() {
  if (!arToolkitSource) return;
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext && arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }

  // Ещё раз принудительно растягиваем видео
  var video = arToolkitSource.domElement;
  if (video) {
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'cover';
  }
}

function updateAR() {
  if (!arToolkitSource || arToolkitSource.ready === false) return;

  arToolkitContext.update(arToolkitSource.domElement);

  // Проверяем видимость маркера
  var visible = markerRoot.visible;
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
