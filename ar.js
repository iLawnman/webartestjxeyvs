"use strict";


const statusElement =
    document.getElementById("status");


function setStatus(text) {

    console.log("[AR]", text);

    statusElement.textContent = text;
}


/*
 * ---------------------------------------------------------
 * GLOBALS
 * ---------------------------------------------------------
 */

let scene;
let camera;
let renderer;

let arSource;
let arContext;

let markerRoot;


/*
 * ---------------------------------------------------------
 * START
 * ---------------------------------------------------------
 */

function startAR() {

    setStatus("Creating scene...");


    /*
     * THREE
     */

    scene =
        new THREE.Scene();


    /*
     * CAMERA
     */

    camera =
        new THREE.Camera();

    scene.add(camera);


    /*
     * RENDERER
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


    document.body.appendChild(
        renderer.domElement
    );


    /*
     * -----------------------------------------------------
     * AR SOURCE
     * -----------------------------------------------------
     */

    setStatus("Starting camera...");


    arSource =
        new THREEx.ArToolkitSource({

            sourceType: "webcam"
        });


    arSource.init(

        function () {

            console.log(
                "AR source initialized"
            );

            setStatus(
                "Camera initialized"
            );

            resize();
        },

        function (error) {

            console.error(
                "Camera initialization error:",
                error
            );

            setStatus(
                "Camera initialization failed"
            );
        }
    );


    /*
     * -----------------------------------------------------
     * AR CONTEXT
     * -----------------------------------------------------
     */

    setStatus("Creating AR context...");


    arContext =
        new THREEx.ArToolkitContext({

            cameraParametersUrl:
                "https://raw.githack.com/AR-js-org/AR.js/3.4.8/three.js/data/camera_para.dat",

            detectionMode:
                "mono",

            maxDetectionRate:
                30,

            canvasWidth:
                640,

            canvasHeight:
                480
        });


    arContext.init(

        function () {

            console.log(
                "AR context initialized"
            );


            camera.projectionMatrix.copy(
                arContext.getProjectionMatrix()
            );


            setStatus(
                "AR initialized"
            );
        }
    );


    /*
     * -----------------------------------------------------
     * MARKER
     * -----------------------------------------------------
     */

    markerRoot =
        new THREE.Group();


    scene.add(
        markerRoot
    );


    setStatus(
        "Creating Hiro marker..."
    );


    new THREEx.ArMarkerControls(

        arContext,

        markerRoot,

        {

            type:
                "pattern",

            patternUrl:
                "hiro.patt",

            changeMatrixMode:
                "cameraTransformMatrix"
        }
    );


    /*
     * -----------------------------------------------------
     * ASSET
     * -----------------------------------------------------
     */

    createAsset();


    /*
     * -----------------------------------------------------
     * RESIZE
     * -----------------------------------------------------
     */

    window.addEventListener(
        "resize",
        resize
    );


    /*
     * -----------------------------------------------------
     * LOOP
     * -----------------------------------------------------
     */

    animate();
}


/*
 * ---------------------------------------------------------
 * ASSET
 * ---------------------------------------------------------
 */

function createAsset() {

    setStatus(
        "Loading asset.png..."
    );


    const loader =
        new THREE.TextureLoader();


    loader.load(

        "asset.png",

        function (texture) {

            console.log(
                "asset.png loaded"
            );


            /*
             * Keep original aspect ratio.
             */

            const width =
                texture.image.width;

            const height =
                texture.image.height;


            const aspect =
                width / height;


            let planeWidth = 1;

            let planeHeight =
                1;


            if (aspect >= 1) {

                planeHeight =
                    1 / aspect;

            } else {

                planeWidth =
                    aspect;
            }


            /*
             * Plane
             */

            const geometry =
                new THREE.PlaneGeometry(

                    planeWidth,

                    planeHeight
                );


            /*
             * Material
             */

            const material =
                new THREE.MeshBasicMaterial({

                    map:
                        texture,

                    transparent:
                        true,

                    side:
                        THREE.DoubleSide,

                    depthTest:
                        false,

                    depthWrite:
                        false
                });


            /*
             * Mesh
             */

            const mesh =
                new THREE.Mesh(

                    geometry,

                    material
                );


            /*
             * Hiro marker coordinate system:
             *
             * X = right
             * Y = up
             * Z = toward camera
             *
             * Put image slightly above marker.
             */

            mesh.position.set(

                0,

                0,

                0.01
            );


            mesh.renderOrder =
                100;


            markerRoot.add(
                mesh
            );


            setStatus(
                "Point camera at Hiro"
            );
        },


        undefined,


        function (error) {

            console.error(
                "asset.png error:",
                error
            );


            setStatus(
                "ERROR: cannot load asset.png"
            );
        }
    );
}


/*
 * ---------------------------------------------------------
 * RESIZE
 * ---------------------------------------------------------
 */

function resize() {

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
 * ---------------------------------------------------------
 * LOOP
 * ---------------------------------------------------------
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
     * Marker status
     */

    if (
        markerRoot &&
        markerRoot.visible
    ) {

        statusElement.textContent =
            "HIRO DETECTED";

    }
    else {

        if (
            arSource &&
            arSource.ready
        ) {

            statusElement.textContent =
                "Searching for Hiro...";
        }
    }
}


/*
 * ---------------------------------------------------------
 * START
 * ---------------------------------------------------------
 */

try {

    startAR();

}
catch (error) {

    console.error(
        "AR INITIALIZATION FAILED:",
        error
    );


    setStatus(
        "AR initialization failed: " +
        error.message
    );
}
