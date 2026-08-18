import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { createTextPanel } from "./TextPanel";

// Cache for loaded models so we don't reload the same GLTF multiple times
const modelCache = {};
const loader = new GLTFLoader();

export const createPedestalLink = (url, modelPath, scaleMultiplier = 1.0, label = "") => {
  const group = new THREE.Group();

  // Create Pedestal (a simple white cylinder)
  const pedestalGeo = new THREE.CylinderGeometry(0.5, 0.6, 1.2, 32);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.2 });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.y = 0.6; // Base at Y=0, top at Y=1.2
  group.add(pedestal);

  // The floating interactive object
  const floatingGroup = new THREE.Group();
  floatingGroup.position.y = 1.8; // Float above the pedestal
  
  // Attach metadata for the interaction raycaster
  floatingGroup.userData = { isInteractable: true, url: url, baseScale: scaleMultiplier };
  pedestal.userData = { isInteractable: true, url: url, linkedGroup: floatingGroup };
  group.add(floatingGroup);

  if (label) {
    const labelGroup = new THREE.Group();
    labelGroup.position.set(0, 0.8, 0.7); 
    labelGroup.rotation.x = -Math.PI / 6; // 30 degrees tilt

    // The text panel
    const labelPanel = createTextPanel(label, 1.0, 0.8);
    labelPanel.position.z = 0.03; // slightly in front of the box
    labelGroup.add(labelPanel);

    // The backing box
    const boxGeo = new THREE.BoxGeometry(1.05, 0.85, 0.05);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); // White box
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    labelGroup.add(boxMesh);

    group.add(labelGroup);
  }

  // Load the GLTF Model
  if (modelCache[modelPath]) {
    const clone = modelCache[modelPath].clone();
    floatingGroup.add(clone);
  } else {
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      
      // Fix Earth texture manually since KHR_materials_pbrSpecularGlossiness might not be supported
      if (modelPath.includes("earth")) {
        const texLoader = new THREE.TextureLoader();
        const texture = texLoader.load("/models/earth/textures/Material.002_diffuse.jpeg");
        texture.colorSpace = THREE.SRGBColorSpace;
        model.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
          }
        });
      }

      // Reset scale to 1 to compute true bounding box
      model.scale.set(1, 1, 1);
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      
      // Shift so center is at 0,0,0
      model.position.sub(center);
      
      // Create a wrapper to apply scale uniformly
      const wrapper = new THREE.Group();
      wrapper.add(model);
      
      // Scale so largest dimension is exactly `scaleMultiplier`
      wrapper.scale.setScalar(scaleMultiplier / maxDim);

      modelCache[modelPath] = wrapper;
      const clone = wrapper.clone();
      floatingGroup.add(clone);
    });
  }

  // Animation logic
  let time = 0;
  group.update = (delta) => {
    time += delta;
    
    // Spin slowly
    floatingGroup.rotation.y += delta * 0.5;
    
    // Float up and down
    floatingGroup.position.y = 1.8 + Math.sin(time * 2) * 0.1;
  };

  return group;
};
