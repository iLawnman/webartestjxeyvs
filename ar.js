let renderer;
let scene;
let camera;

let arSource;
let arContext;

let markerRoot;

let assetObject = null;

const statusElement =
    document.getElementById("status");


function status(text) {

    console.log("[AR]", text);

    statusElement.textContent = text;
}


/*
 * --------------------------------------------------
 * INIT
 * --------------------------------------------------
 */

function init() {

    status("Creating Three.js...");

    /*
     * Scene
     */

    scene = new THREE.Scene();


    /*
     * Camera
     */

    camera = new THREE.Camera();

    scene.add(camera);


    /*
     * Renderer
     */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    renderer.setPixelRatio(
        window.devicePixelRatio
    );

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.domElement.style.position =
        "fixed";

    renderer.domElement.style.left =
        "0";

    renderer.domElement.style.top =
        "0";

    renderer.domElement.style.width =
        "100%";

    renderer.domElement.style.height =
        "100%";

    document.body.appendChild(
        renderer.domElement
    );


    /*
     * AR Source
     */

    status("Starting camera...");

    arSource =
        new THREEx.ArToolkitSource({
            sourceType: "webcam"
        });


    arSource.init(
        function () {

            status("Camera started");

            onResize();

        },
        function (error) {

            console.error(
                "ARSource error:",
                error
            );

            status(
                "Camera error: " +
                error
            );
        }
    );


    /*
     * AR Context
     */

    arContext =
        new THREEx.ArToolkitContext({

            cameraParametersUrl:
                "https://cdn.jsdelivr.net/npm/ar.js@3.4.8/three.js/data/camera_para.dat",

            detectionMode: "mono",

            maxDetectionRate: 30,

            canvasWidth: 640,

            canvasHeight: 480
        });


    arContext.init(
        function () {

            status(
                "AR context initialized"
            );

            camera.projectionMatrix.copy(
                arContext.getProjectionMatrix()
            );

        }
    );


    /*
     * Marker
     */

    markerRoot =
        new THREE.Group();

    scene.add(markerRoot);


    new THREEx.ArMarkerControls(
        arContext,
        markerRoot,
        {
            type: "pattern",

            patternUrl:
                "hiro.patt",

            changeMatrixMode:
                "cameraTransformMatrix"
        }
    );


    /*
     * Load asset
     */

    loadAsset();


    /*
     * Resize
     */

    window.addEventListener(
        "resize",
        onResize
    );


    /*
     * Loop
     */

    animate();
}


/*
 * --------------------------------------------------
 * ASSET
 * --------------------------------------------------
 */

function loadAsset() {

    status("Loading asset.png...");

    const loader =
        new THREE.TextureLoader();


    loader.load(

        "asset.png",

        function (texture) {

            status(
                "Point camera at Hiro marker"
            );


            texture.minFilter =
                THREE.LinearFilter;

            texture.magFilter =
                THREE.LinearFilter;


            const material =
                new THREE.MeshBasicMaterial({

                    map: texture,

                    transparent: true,

                    side: THREE.DoubleSide,

                    depthTest: false,

                    depthWrite: false
                });


            /*
             * 1 x 1 plane.
             *
             * Hiro marker size = 1 unit.
             */

            const geometry =
                new THREE.PlaneGeometry(
                    1,
                    1
                );


            assetObject =
                new THREE.Mesh(
                    geometry,
                    material
                );


            /*
             * Slightly above marker.
             */

            assetObject.position.set(
                0,
                0,
                0.01
            );


            assetObject.rotation.set(
                0,
                0,
                0
            );


            assetObject.renderOrder =
                100;


            markerRoot.add(
                assetObject
            );


        },

        undefined,

        function (error) {

            console.error(
                "asset.png loading error:",
                error
            );

            status(
                "ERROR: asset.png not found"
            );
        }
    );
}


/*
 * --------------------------------------------------
 * RESIZE
 * --------------------------------------------------
 */

function onResize() {

    if (!arSource) {
        return;
    }


    arSource.onResizeElement();

    arSource.copyElementSizeTo(
        renderer.domElement
    );


    if (
        arContext &&
        arContext.arController
    ) {

        arSource.copyElementSizeTo(
            arContext.arController.canvas
        );
    }
}


/*
 * --------------------------------------------------
 * LOOP
 * --------------------------------------------------
 */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        arSource &&
        arSource.ready
    ) {

        arContext.update(
            arSource.domElement
        );
    }


    renderer.render(
        scene,
        camera
    );


    /*
     * Debug marker state
     */

    if (markerRoot) {

        if (markerRoot.visible) {

            statusElement.textContent =
                "HIRO DETECTED";

        } else {

            statusElement.textContent =
                "Searching for Hiro...";
        }
    }
}


/*
 * --------------------------------------------------
 * START
 * --------------------------------------------------
 */

try {

    init();

}
catch (error) {

    console.error(
        "AR initialization failed:",
        error
    );

    status(
        "AR initialization failed: " +
        error.message
    );
}
