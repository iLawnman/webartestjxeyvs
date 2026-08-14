// tree.js — arTarget на маркере через сглаженный smoothRoot

var scene, camera, renderer;
var markerRoot;
var smoothRoot = null;
var arTarget = null;
var assetMesh = null;
var buttonMesh = null;
var helpMesh = null;
var questionMesh = null;

var raycaster = new THREE.Raycaster();
var pointer = new THREE.Vector2();

var SMOOTH = 0.18;
var _pos = new THREE.Vector3();
var _quat = new THREE.Quaternion();
var _scale = new THREE.Vector3();
var _posS = new THREE.Vector3();
var _quatS = new THREE.Quaternion();
var _scaleS = new THREE.Vector3(1, 1, 1);
var smoothReady = false;

function initThree() {
  scene = new THREE.Scene();

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color(0x000000), 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.zIndex = '1';
  document.body.appendChild(renderer.domElement);

  markerRoot = new THREE.Group();
  markerRoot.matrixAutoUpdate = false;
  scene.add(markerRoot);
  markerRoot.visible = false;

  smoothRoot = new THREE.Group();
  scene.add(smoothRoot);
  smoothRoot.visible = false;

  var light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  window.addEventListener('resize', onResize);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
}

function onResize() {
  if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
  renderer.render(scene, camera);
}

function makeTextTexture(text, opts) {
  opts = opts || {};
  var w = opts.w || 512;
  var h = opts.h || 512;
  var bg = opts.bg || '#ffffff';
  var fg = opts.fg || '#e11d48';
  var fontSize = opts.fontSize || 42;
  var canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  var ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, w, h, 28);
  ctx.fill();

  ctx.strokeStyle = '#111';
  ctx.lineWidth = 10;
  roundRect(ctx, 8, 8, w - 16, h - 16, 22);
  ctx.stroke();

  ctx.fillStyle = fg;
  ctx.font = 'bold ' + fontSize + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  var lines = String(text).split('\n');
  var lineH = fontSize * 1.25;
  var startY = h / 2 - ((lines.length - 1) * lineH) / 2;
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], w / 2, startY + i * lineH);
  }

  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makePanel(width, height, texture, name) {
  var geo = new THREE.PlaneGeometry(width, height);
  var mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.name = name || 'panel';
  return mesh;
}

function buildArTargetUI() {
  arTarget = new THREE.Group();
  arTarget.name = 'arTarget';

  var panelW = 0.55;
  var panelH = 0.55;
  var gap = 0.08;
  var btnW = 0.7;
  var btnH = 0.22;

  var helpTex = makeTextTexture('help', {
    w: 512, h: 512, fontSize: 64, fg: '#e11d48', bg: '#ffffff'
  });
  helpMesh = makePanel(panelW, panelH, helpTex, 'help');
  helpMesh.position.set(-(panelW + gap), 0.02, 0);
  helpMesh.rotation.x = -Math.PI / 2;
  helpMesh.rotation.z = 0.15;
  arTarget.add(helpMesh);

  var qTex = makeTextTexture('вопрос или\nвариант\nответа', {
    w: 512, h: 512, fontSize: 40, fg: '#e11d48', bg: '#ffffff'
  });
  questionMesh = makePanel(panelW, panelH, qTex, 'question');
  questionMesh.position.set(0, 0.02, 0);
  questionMesh.rotation.x = -Math.PI / 2;
  arTarget.add(questionMesh);

  var assetTex = new THREE.TextureLoader().load('asset.png');
  assetMesh = makePanel(panelW, panelH, assetTex, 'arTargetHit');
  assetMesh.position.set(panelW + gap, 0.02, 0);
  assetMesh.rotation.x = -Math.PI / 2;
  assetMesh.rotation.z = -0.15;
  arTarget.add(assetMesh);

  var btnTex = makeTextTexture('кнопка', {
    w: 512, h: 200, fontSize: 48, fg: '#e11d48', bg: '#ffffff'
  });
  buttonMesh = makePanel(btnW, btnH, btnTex, 'buttonHit');
  buttonMesh.position.set(0, 0.02, panelH / 2 + gap + btnH / 2);
  buttonMesh.rotation.x = -Math.PI / 2;
  arTarget.add(buttonMesh);

  return arTarget;
}

function createAnchorFromMarker() {
  if (arTarget && arTarget.parent) arTarget.parent.remove(arTarget);
  arTarget = null;
  assetMesh = null;
  buttonMesh = null;
  helpMesh = null;
  questionMesh = null;
  smoothReady = false;

  buildArTargetUI();
  smoothRoot.add(arTarget);
  smoothRoot.visible = true;
  syncSmooth(true);
  return smoothRoot;
}

function hideArTarget() {
  if (arTarget) arTarget.visible = false;
  if (smoothRoot) smoothRoot.visible = false;
}

function syncSmooth(immediate) {
  if (!markerRoot || !smoothRoot) return;

  markerRoot.matrix.decompose(_pos, _quat, _scale);

  if (immediate || !smoothReady) {
    _posS.copy(_pos);
    _quatS.copy(_quat);
    _scaleS.copy(_scale);
    smoothReady = true;
  } else {
    _posS.lerp(_pos, SMOOTH);
    _quatS.slerp(_quat, SMOOTH);
    _scaleS.lerp(_scale, SMOOTH);
  }

  smoothRoot.position.copy(_posS);
  smoothRoot.quaternion.copy(_quatS);
  smoothRoot.scale.copy(_scaleS);
  smoothRoot.updateMatrixWorld(true);
}

function onPointerDown(event) {
  if (typeof appState === 'undefined' || appState !== 'waitingAnswer') return;
  if (!arTarget || !arTarget.visible) return;

  var rect = renderer.domElement.getBoundingClientRect();
  var x = (event.clientX - rect.left) / rect.width;
  var y = (event.clientY - rect.top) / rect.height;

  pointer.x = x * 2 - 1;
  pointer.y = -(y * 2 - 1);

  raycaster.setFromCamera(pointer, camera);

  var targets = [];
  if (buttonMesh) targets.push(buttonMesh);
  if (assetMesh) targets.push(assetMesh);

  var hits = raycaster.intersectObjects(targets, false);
  if (hits.length > 0 && typeof onArTargetClicked === 'function') {
    onArTargetClicked();
  }
}
