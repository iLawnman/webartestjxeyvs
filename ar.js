class ARSystem {

  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;

    this.arSource = null;
    this.arContext = null;
    this.markerRoot = null;
    this.markerControls = null;

    this.initialized = false;
    this.markerVisible = false;
  }

  async init() {

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild(this.renderer.domElement);

    /*
     * AR.js camera source
     */
    this.arSource = new THREEx.ArToolkitSource({
      sourceType: 'webcam'
    });

    await new Promise((resolve) => {

      this.arSource.init(() => {

        this.resize();

        resolve();
      });

    });

    /*
     * AR.js context
     */
    this.arContext = new THREEx.ArToolkitContext({

      cameraParametersUrl:
          'https://cdn.jsdelivr.net/npm/ar.js@3.4.7/three.js/data/camera_para.dat',

      detectionMode: 'mono',

      matrixCodeType: '3x3'
    });

    await new Promise((resolve) => {

      this.arContext.init(() => {

        this.camera.projectionMatrix.copy(
            this.arContext.getProjectionMatrix()
        );

        resolve();
      });

    });

    /*
     * Marker root
     */
    this.markerRoot = new THREE.Group();

    this.scene.add(this.markerRoot);

    /*
     * Hiro marker
     */
    this.markerControls = new THREEx.ArMarkerControls(
        this.arContext,
        this.markerRoot,
        {
          type: 'pattern',
          patternUrl: 'hiro.patt',

          changeMatrixMode: 'modelViewMatrix'
        }
    );

    this.markerRoot.visible = false;

    window.addEventListener(
        'resize',
        () => this.resize()
    );

    this.initialized = true;

    this.setStatus('Point camera at Hiro marker');
  }

  resize() {

    if (!this.arSource) {
      return;
    }

    this.arSource.onResizeElement();

    this.arSource.copyElementSizeTo(
        this.renderer.domElement
    );

    if (this.arContext.arController) {

      this.arSource.copyElementSizeTo(
          this.arContext.arController.canvas
      );
    }
  }

  update() {

    if (!this.initialized) {
      return;
    }

    if (
        this.arSource &&
        this.arSource.ready
    ) {
      this.arContext.update(
          this.arSource.domElement
      );
    }

    /*
     * AR.js changes markerRoot.visible.
     */
    const visible = this.markerRoot.visible;

    if (visible !== this.markerVisible) {

      this.markerVisible = visible;

      if (visible) {
        this.setStatus('Hiro detected');
      } else {
        this.setStatus('Point camera at Hiro marker');
      }
    }
  }

  render() {

    this.renderer.render(
        this.scene,
        this.camera
    );
  }

  setStatus(text) {

    const element =
        document.getElementById('status');

    if (element) {
      element.textContent = text;
    }
  }
}


window.AR = new ARSystem();