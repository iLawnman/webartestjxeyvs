// ar.js — AR.js: источник, контекст, маркер Hiro

var arToolkitSource, arToolkitContext;

function initAR() {
  // Источник — веб-камера
  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: 'webcam'
  });

  arToolkitSource.init(function onReady() {
    onResizeAR();
    var loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';
  });

  window.addEventListener('resize', onResizeAR);

  // Контекст AR
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'camera_para.dat',
    detectionMode: 'mono',
    maxDetectionRate: 30
  });

  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  // Маркер Hiro
  new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern',
    patternUrl: 'hiro.patt',
    changeMatrixMode: 'modelViewMatrix'
  });
}

function onResizeAR() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
}

function updateAR() {
  if (arToolkitSource.ready === false) return;
  arToolkitContext.update(arToolkitSource.domElement);
}

// ===== Запуск =====
initThree();
initAR();

function animate() {
  requestAnimationFrame(animate);
  updateAR();
  render();
}
animate();
