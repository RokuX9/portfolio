import "./style.css";
import * as THREE from "three";
import { PlayerController } from "./components/controllers/PlayerController";
import { map, colliders, portals, interactables, updatables } from "./components/scenes/Map";
import camera from "./components/Camera";
import renderer from "./components/Renderer";

const timer = new THREE.Timer();
const playerController = new PlayerController(camera, renderer.domElement);

// Initialize player position inside the Wide Hall
camera.position.set(0, 1.6, 0);
camera.lookAt(-10, 1.6, 0); // Face West (towards text panels)
playerController.setColliders(colliders);

document.getElementById("room-selector").addEventListener("change", (e) => {
  const room = e.target.value;
  switch (room) {
    case "hall":
      camera.position.set(0, 1.6, 0);
      camera.lookAt(-9.9, 1.6, 0); // Face West
      break;
    case "roomA":
      camera.position.set(100, 1.6, 0);
      camera.lookAt(100.1, 1.6, 10); // Face South
      break;
    case "roomB":
      camera.position.set(200, 1.6, 0);
      camera.lookAt(200.1, 1.6, 10); // Face South
      break;
    case "roomC":
      camera.position.set(300, 1.6, 0);
      camera.lookAt(300.1, 1.6, 10); // Face South
      break;
  }
  camera.updateMatrixWorld(true);
  
  // Unfocus the dropdown so WASD keys continue to work
  e.target.blur();
});
playerController.setPortals(portals);
playerController.setInteractables(interactables);

// Hide dropdown when using FPS controls
document.addEventListener("pointerlockchange", () => {
  const roomSelector = document.getElementById("room-selector");
  if (document.pointerLockElement) {
    roomSelector.classList.add("hidden");
  } else {
    roomSelector.classList.remove("hidden");
  }
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

// We also might want to call it on orientation change specifically for mobile
window.addEventListener("orientationchange", () => {
  // Give the browser a moment to update innerWidth/Height
  setTimeout(onWindowResize, 100);
});

function animate() {
  requestAnimationFrame(animate);
  timer.update();
  const delta = timer.getDelta();
  
  playerController.update(delta);
  
  // Update updatables
  for (const updatable of updatables) {
    if (updatable.update) updatable.update(delta);
  }
  
  // Render portals
  for (const portal of portals) {
    portal.render(renderer, map, camera, portals);
  }

  // Render main scene
  renderer.render(map, camera);
}

animate();
