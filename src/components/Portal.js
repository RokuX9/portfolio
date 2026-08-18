import * as THREE from "three";

export class Portal extends THREE.Mesh {
  constructor(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    // Render target for the portal texture
    const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });
    const recursiveRenderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    });
    
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: renderTarget.texture },
      },
      vertexShader: `
        varying vec4 vScreenPos;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vScreenPos = gl_Position;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec4 vScreenPos;
        void main() {
          vec2 uv = (vScreenPos.xy / vScreenPos.w) * 0.5 + 0.5;
          gl_FragColor = texture2D(map, uv);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      side: THREE.DoubleSide,
    });
    super(geometry, material);

    this.renderTarget = renderTarget;
    this.recursiveRenderTarget = recursiveRenderTarget;
    this.destinationPortal = null;
    this.rendering = false;
    this.frustumCulled = false; // Prevent clipping/disappearing at extreme angles

    // The camera that will capture the view from the destination portal
    this.portalCamera = new THREE.PerspectiveCamera(75, width / height, 0.001, 1000);
    
    // We let Three.js auto-update the matrix from position/quaternion/scale
  }

  setDestination(portal) {
    this.destinationPortal = portal;
  }

  updateCamera(mainCamera) {
    if (!this.destinationPortal) return;

    // Sync portal camera parameters with main camera
    this.portalCamera.aspect = mainCamera.aspect;
    this.portalCamera.fov = mainCamera.fov;
    this.portalCamera.near = mainCamera.near;
    this.portalCamera.far = mainCamera.far;
    this.portalCamera.updateProjectionMatrix();

    // Calculate relative transform from this portal to main camera
    const destMatrix = this.destinationPortal.matrixWorld.clone();
    
    // Rotate 180 degrees around Y axis so you look OUT of the destination portal
    const rotationY180 = new THREE.Matrix4().makeRotationY(Math.PI);
    destMatrix.multiply(rotationY180);

    const srcInverse = this.matrixWorld.clone().invert();
    
    // portalCamera.matrixWorld = destinationPortal * rotation180 * sourcePortal^-1 * mainCamera
    this.portalCamera.matrixWorld.copy(destMatrix)
      .multiply(srcInverse)
      .multiply(mainCamera.matrixWorld);

    // Update position, quaternion, and scale from the calculated matrixWorld
    this.portalCamera.matrixWorld.decompose(
      this.portalCamera.position,
      this.portalCamera.quaternion,
      this.portalCamera.scale
    );
    this.portalCamera.updateMatrixWorld(true);

    // Apply Oblique Near-Plane Clipping (Eric Lengyel's algorithm)
    // This prevents objects in the destination room that are "behind" the portal from clipping through the view.
    const clipPlane = new THREE.Plane();
    
    // The normal of the destination portal points into the destination room. We want to keep everything in that direction.
    const destWorldQuat = new THREE.Quaternion();
    this.destinationPortal.getWorldQuaternion(destWorldQuat);
    const destNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(destWorldQuat).normalize();
    
    const destPoint = new THREE.Vector3();
    this.destinationPortal.getWorldPosition(destPoint);
    clipPlane.setFromNormalAndCoplanarPoint(destNormal, destPoint);
    
    // Transform the plane into the portalCamera's view space
    const cameraInverse = this.portalCamera.matrixWorld.clone().invert();
    clipPlane.applyMatrix4(cameraInverse);
    
    const clipVector = new THREE.Vector4(clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.constant);
    
    // Calculate the new projection matrix
    const projectionMatrix = this.portalCamera.projectionMatrix;
    const q = new THREE.Vector4(
      (Math.sign(clipVector.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0],
      (Math.sign(clipVector.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5],
      -1.0,
      (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]
    );

    const c = clipVector.multiplyScalar(2.0 / clipVector.dot(q));
    
    projectionMatrix.elements[2] = c.x;
    projectionMatrix.elements[6] = c.y;
    projectionMatrix.elements[10] = c.z + 1.0 - 0.01; // small bias to prevent z-fighting
    projectionMatrix.elements[14] = c.w;
  }

  render(renderer, scene, mainCamera, portals, recursionLevel = 0) {
    if (!this.destinationPortal) return;

    // Prevent infinite loops if things get weird
    if (this.rendering) return;
    this.rendering = true;

    // Save current renderer state
    const currentRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

    // Match render target resolution to screen
    const size = new THREE.Vector2();
    renderer.getSize(size);
    const pixelRatio = renderer.getPixelRatio();
    const width = size.x * pixelRatio;
    const height = size.y * pixelRatio;

    // Prevent zero-size render target errors
    if (width > 0 && height > 0) {
      if (this.renderTarget.width !== width || this.renderTarget.height !== height) {
        this.renderTarget.setSize(width, height);
        this.recursiveRenderTarget.setSize(width, height);
      }
    }

    // Setup for portal rendering
    renderer.xr.enabled = false; 
    renderer.shadowMap.autoUpdate = false;

    this.updateCamera(mainCamera);

    // If we are at level 0 (Main camera), we need to prepare the recursive view for ANY portal 
    // that might be visible through THIS portal.
    if (recursionLevel === 0 && portals) {
      for (const other of portals) {
        if (other !== this && other !== this.destinationPortal) {
          // Render the other portal into its recursive render target!
          other.render(renderer, scene, this.portalCamera, portals, 1);
          // Set its material to use the recursive texture for the upcoming scene render!
          other.material.uniforms.map.value = other.recursiveRenderTarget.texture;
        }
      }
    }

    // Hide this portal mesh so it doesn't render itself recursively
    // and hide destination portal to prevent infinite feedback loop
    this.visible = false;
    this.destinationPortal.visible = false;

    // Pick which render target to write to
    const target = recursionLevel === 0 ? this.renderTarget : this.recursiveRenderTarget;
    
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, this.portalCamera);

    // Restore state
    this.visible = true;
    this.destinationPortal.visible = true;

    // Restore other portals to use their main texture!
    if (recursionLevel === 0 && portals) {
      for (const other of portals) {
        if (other !== this && other !== this.destinationPortal) {
          other.material.uniforms.map.value = other.renderTarget.texture;
        }
      }
    }

    renderer.setRenderTarget(currentRenderTarget);
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    this.rendering = false;
  }
}
