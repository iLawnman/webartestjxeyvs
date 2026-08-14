// tree.js — сцена, камера, рендерер, картинка

var scene, camera, renderer;
var markerRoot;
var assetMesh;

function initThree() {
  // Сцена
  scene = new THREE.Scene();

  // Камера (управляется AR)
  camera = new THREE.Camera();
  scene.add(camera);

  // Рендерер
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0px';
  renderer.domElement.style.left = '0px';
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
  assetMesh.rotation.x = -Math.PI / 2; // лежать плашмя на маркере
  markerRoot.add(assetMesh);

  // Свет
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
