class MarkerObject {

  constructor(markerRoot) {

    this.markerRoot = markerRoot;

    this.object = null;

    this.load();
  }

  load() {

    const loader =
        new THREE.TextureLoader();

    loader.load(
        'asset.png',

        (texture) => {

          texture.encoding =
              THREE.sRGBEncoding;

          texture.minFilter =
              THREE.LinearFilter;

          texture.magFilter =
              THREE.LinearFilter;

          /*
           * asset.png is placed directly
           * above the Hiro marker.
           */
          const material =
              new THREE.MeshBasicMaterial({

                map: texture,

                transparent: true,

                side: THREE.DoubleSide,

                depthTest: false,

                depthWrite: false
              });

          /*
           * Adjust these dimensions if required.
           *
           * Hiro marker is approximately
           * 1 AR.js unit wide.
           */
          const geometry =
              new THREE.PlaneGeometry(
                  1.0,
                  1.0
              );

          this.object =
              new THREE.Mesh(
                  geometry,
                  material
              );

          /*
           * Three.js plane is XY.
           *
           * AR.js marker lies in XY plane,
           * so this is directly above the marker.
           */
          this.object.position.set(
              0,
              0,
              0.02
          );

          this.object.renderOrder = 100;

          this.markerRoot.add(
              this.object
          );
        },

        undefined,

        (error) => {

          console.error(
              'Cannot load asset.png',
              error
          );
        }
    );
  }
}


async function start() {

  try {

    await AR.init();

    /*
     * Create object attached to Hiro marker.
     */
    const markerObject =
        new MarkerObject(
            AR.markerRoot
        );

    /*
     * Animation loop
     */
    function animate() {

      requestAnimationFrame(
          animate
      );

      AR.update();

      AR.render();
    }

    animate();

  } catch (error) {

    console.error(error);

    AR.setStatus(
        'AR initialization failed'
    );
  }
}


start();