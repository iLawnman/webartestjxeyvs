// tree.js — сцена, камера, рендерер, картинка

var scene, camera, renderer;
var markerRoot;
var assetMesh;

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

  // Группа маркера
  markerRoot = new THREE.Group();
  scene.add(markerRoot);

  // Картинка asset.png поверх маркера
  var geometry = new THREE.PlaneGeometry(1, 1);
  var texture = new THREE.TextureLoader().load('asset.png');
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });

  assetMesh = new THREE.Mesh(geometry, material);
  assetMesh.rotation.x = -Math.PI / 2;
  markerRoot.add(assetMesh);

  var light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  window.addEventListener('resize', onResize);
}

function onResize() {
  if (renderer) {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function render() {
  renderer.render(scene, camera);
}
