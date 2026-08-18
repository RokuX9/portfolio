import * as THREE from "three";

const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.001,
  1000,
);
camera.position.setY(1);

export default camera;
