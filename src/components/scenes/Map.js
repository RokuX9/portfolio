import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { createWideHall, createCubeRoom } from "../blueprints/Room";
import { Portal } from "../Portal";
import { createTextPanel } from "../TextPanel";
import { createPedestalLink } from "../PedestalLink";

const map = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();

function loadTex(path, repeatX, repeatY) {
  const tex = textureLoader.load(path);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  return tex;
}

// Hall Textures
const hallFloorTex = loadTex("/textures/patterned_terracotta_tiling/patterned_terracotta_tiling_diff_4k.jpg", 10, 20);
const hallWallTex = loadTex("/textures/stone_brick_wall_001/stone_brick_wall_001_diff_4k.jpg", 6, 2);
const hallCeilingTex = loadTex("/textures/granular_concrete/granular_concrete_diff_4k.jpg", 10, 20);

// Cube Room Textures
const cubeFloorTex = loadTex("/textures/old_wooden_floor_02/old_wooden_floor_02_diff_4k.jpg", 5, 5);
const cubeWallTex = loadTex("/textures/white_stucco/white_stucco_diff_4k.jpg", 4, 1);

// We create the rooms far apart so they don't intersect
const hallGroup = new THREE.Group();
hallGroup.position.set(0, 0, 0);

const roomAGroup = new THREE.Group();
roomAGroup.position.set(100, 0, 0);

const roomBGroup = new THREE.Group();
roomBGroup.position.set(200, 0, 0);

const roomCGroup = new THREE.Group();
roomCGroup.position.set(300, 0, 0);

const hall = createWideHall({
  floor: new THREE.MeshStandardMaterial({ map: hallFloorTex, color: 0xffffff }),
  wall: new THREE.MeshStandardMaterial({ map: hallWallTex, color: 0xffffff }),
  ceiling: new THREE.MeshStandardMaterial({ map: hallCeilingTex, color: 0xffffff })
});

const roomA = createCubeRoom({
  floor: new THREE.MeshStandardMaterial({ map: cubeFloorTex, color: 0xffffff }),
  wall: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff }),
  ceiling: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff })
});

const roomB = createCubeRoom({
  floor: new THREE.MeshStandardMaterial({ map: cubeFloorTex, color: 0xffffff }),
  wall: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff }),
  ceiling: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff })
});

const roomC = createCubeRoom({
  floor: new THREE.MeshStandardMaterial({ map: cubeFloorTex, color: 0xffffff }),
  wall: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff }),
  ceiling: new THREE.MeshStandardMaterial({ map: cubeWallTex, color: 0xffffff })
});

hallGroup.add(hall);
roomAGroup.add(roomA);
roomBGroup.add(roomB);
roomCGroup.add(roomC);

map.add(hallGroup);
map.add(roomAGroup);
map.add(roomBGroup);
map.add(roomCGroup);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
map.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffffff, 10);
pointLight1.position.set(0, 4, 0);
hallGroup.add(pointLight1);

const pointLightA = new THREE.PointLight(0xffffff, 10);
pointLightA.position.set(0, 4, 0);
roomAGroup.add(pointLightA);

const pointLightB = new THREE.PointLight(0xffffff, 10);
pointLightB.position.set(0, 4, 0);
roomBGroup.add(pointLightB);

const pointLightC = new THREE.PointLight(0xffffff, 10);
pointLightC.position.set(0, 4, 0);
roomCGroup.add(pointLightC);

// Create Portals
const portals = [];

// --- Main Hall Portals ---
const hallNorthPortal = new Portal(10, 5);
hallNorthPortal.position.set(10, 2.5, -10);
hallNorthPortal.rotation.y = -Math.PI / 2; // Faces -X
hallGroup.add(hallNorthPortal);
portals.push(hallNorthPortal);

const hallSouthPortal = new Portal(10, 5);
hallSouthPortal.position.set(10, 2.5, 10);
hallSouthPortal.rotation.y = -Math.PI / 2; // Faces -X
hallGroup.add(hallSouthPortal);
portals.push(hallSouthPortal);

// --- Room A Portals ---
const roomANorthPortal = new Portal(10, 5);
roomANorthPortal.position.set(0, 2.5, -10); // Faces +Z
roomAGroup.add(roomANorthPortal);
portals.push(roomANorthPortal);

const roomAEastPortal = new Portal(10, 5);
roomAEastPortal.position.set(10, 2.5, 0);
roomAEastPortal.rotation.y = -Math.PI / 2; // Faces -X
roomAGroup.add(roomAEastPortal);
portals.push(roomAEastPortal);

// --- Room B Portals ---
const roomBNorthPortal = new Portal(10, 5);
roomBNorthPortal.position.set(0, 2.5, -10); // Faces +Z
roomBGroup.add(roomBNorthPortal);
portals.push(roomBNorthPortal);

const roomBEastPortal = new Portal(10, 5);
roomBEastPortal.position.set(10, 2.5, 0);
roomBEastPortal.rotation.y = -Math.PI / 2; // Faces -X
roomBGroup.add(roomBEastPortal);
portals.push(roomBEastPortal);

// --- Room C Portals ---
const roomCNorthPortal = new Portal(10, 5);
roomCNorthPortal.position.set(0, 2.5, -10); // Faces +Z
roomCGroup.add(roomCNorthPortal);
portals.push(roomCNorthPortal);

const roomCEastPortal = new Portal(10, 5);
roomCEastPortal.position.set(10, 2.5, 0);
roomCEastPortal.rotation.y = -Math.PI / 2; // Faces -X
roomCGroup.add(roomCEastPortal);
portals.push(roomCEastPortal);


// --- Link Portals ---
// Main Hall North <-> Room A East
hallNorthPortal.setDestination(roomAEastPortal);
roomAEastPortal.setDestination(hallNorthPortal);

// Main Hall South <-> Room C North
hallSouthPortal.setDestination(roomCNorthPortal);
roomCNorthPortal.setDestination(hallSouthPortal);

// Room A North <-> Room B East
roomANorthPortal.setDestination(roomBEastPortal);
roomBEastPortal.setDestination(roomANorthPortal);

// Room B North <-> Room C East
roomBNorthPortal.setDestination(roomCEastPortal);
roomCEastPortal.setDestination(roomBNorthPortal);


// We'll update the matrix world AT THE VERY END, after all pedestals have been added to the scene!

// Gather colliders (all meshes inside the rooms except portals)
const colliders = [];
[hall, roomA, roomB, roomC].forEach(room => {
  room.traverse((child) => {
    if (child.isMesh) colliders.push(child);
  });
});

const interactables = [];
const updatables = [];

// --- Populate Main Hall ---
const hallText1 = createTextPanel("# Curator & Engineer\n\nFull-stack developer and technical support engineer focused on responsive interfaces, real-time protocols, and interactive 3D web experiences. Experienced in deploying containerized systems, managing cloud infrastructure, and building applications that feel native, reliable, and tactile.", 6, 5);
hallText1.position.set(-9.9, 2.5, -3.5);
hallText1.rotation.y = Math.PI / 2;
hallGroup.add(hallText1);

const hallText2 = createTextPanel("# Technical Toolkit\n\n## CORE:\nPython, JavaScript, React, Three.js, Node.js, Express.js\n## CLOUD & DEVOPS:\nAWS, GCP, Azure, Docker, Kubernetes, Linux, Nginx\n## DATABASES & PROTOCOLS:\nSQL, MongoDB, Firestore, GraphQL, WebRTC, WebSockets, REST APIs", 6, 5);
hallText2.position.set(-9.9, 2.5, 3.5);
hallText2.rotation.y = Math.PI / 2;
hallGroup.add(hallText2);

const githubProfile = createPedestalLink("https://github.com/RokuX9", "/models/github/scene.gltf", 0.8, "Github Profile");
githubProfile.position.set(-5, 0, -5);
githubProfile.rotation.y = Math.PI / 4;
hallGroup.add(githubProfile);

const linkedinProfile = createPedestalLink("https://www.linkedin.com/in/dean-nash/", "/models/linkedin/scene.gltf", 0.8, "LinkedIn");
linkedinProfile.position.set(-5, 0, 5);
linkedinProfile.rotation.y = Math.PI * 0.75;
hallGroup.add(linkedinProfile);

// --- Populate Room A ---
const roomAText = createTextPanel("# Around The World\n\nA responsive social photo-sharing platform focused on community interaction, user galleries, and media discovery.\n\n## HIGHLIGHTS:\n- Token-based secure user authentication\n- Photo uploads with custom titles\n- Interactive post-liking functionality\n\n## TECH STACK:\nReact, Node.js, Express.js, REST API", 12, 5);
roomAText.position.set(0, 2.5, 9.9);
roomAText.rotation.y = Math.PI;
roomAGroup.add(roomAText);

const earthLink = createPedestalLink("https://around.rokux9.com", "/models/earth/scene.gltf", 0.8, "Live Demo");
earthLink.position.set(-5, 0, 5);
roomAGroup.add(earthLink);
earthLink.rotation.y = Math.PI * 0.75;

const roomARepo = createPedestalLink("https://github.com/RokuX9/react-around-api-full", "/models/github/scene.gltf", 0.8, "Github Repo");
roomARepo.position.set(5, 0, 5);
roomAGroup.add(roomARepo);
roomARepo.rotation.y = -Math.PI * 0.75;

// Orbiting satellites around Earth
const loader = new GLTFLoader();
const satellitesGroup = new THREE.Group();
satellitesGroup.position.y = 1.8; // Same height as floating object
earthLink.add(satellitesGroup);

loader.load("/models/satellite/scene.gltf", (gltf) => {
  const satModel = gltf.scene;
  const box = new THREE.Box3().setFromObject(satModel);
  const center = box.getCenter(new THREE.Vector3());
  satModel.position.sub(center);
  satModel.scale.set(0.005, 0.005, 0.005);

  for (let i = 0; i < 10; i++) {
    const wrapper = new THREE.Group();
    const angle = (i / 10) * Math.PI * 2;
    wrapper.rotation.y = angle;
    wrapper.rotation.z = (Math.random() - 0.5) * 0.5; // Random slight tilt

    const clone = satModel.clone();
    clone.position.set(0.8, 0, 0); // Orbit radius closer
    wrapper.add(clone);
    satellitesGroup.add(wrapper);
  }
});

earthLink.update = (delta) => {
  earthLink.children[1].rotation.y += delta * 0.5; // Earth spin
  earthLink.children[1].position.y = 1.8 + Math.sin(Date.now() * 0.002) * 0.1;
  satellitesGroup.rotation.y += delta * 1.0; // Satellites orbit faster
  satellitesGroup.rotation.z += delta * 0.2; // slight wobble
  satellitesGroup.position.y = earthLink.children[1].position.y;
};

// --- Populate Room B ---
const roomBText = createTextPanel("# News Explorer\n\nA personalized news discovery engine that queries global feeds and allows authenticated users to curate persistent reading lists.\n\n## HIGHLIGHTS:\n- Dynamic third-party API keyword search and aggregation\n- Categorized feed filtering\n- Authenticated persistent bookmark storage\n\n## TECH STACK:\nReact, Express.js, Node.js, REST APIs", 12, 5);
roomBText.position.set(0, 2.5, 9.9);
roomBText.rotation.y = Math.PI;
roomBGroup.add(roomBText);

const newsLink = createPedestalLink("https://news.rokux9.com", "/models/microphone/scene.gltf", 0.8, "Live Demo");
newsLink.position.set(-5, 0, 0);
roomBGroup.add(newsLink);
newsLink.rotation.y = Math.PI / 2;

const newsFrontRepo = createPedestalLink("https://github.com/RokuX9/news-explorer-frontend", "/models/github/scene.gltf", 0.8, "Frontend Repo");
newsFrontRepo.position.set(5, 0, -5);
roomBGroup.add(newsFrontRepo);
newsFrontRepo.rotation.y = -Math.PI / 4;

const newsBackRepo = createPedestalLink("https://github.com/RokuX9/news-explorer-api", "/models/github/scene.gltf", 0.8, "Backend Repo");
newsBackRepo.position.set(5, 0, 5);
roomBGroup.add(newsBackRepo);
newsBackRepo.rotation.y = -Math.PI * 0.75;

// --- Populate Room C ---
const roomCText = createTextPanel("# Quick Chat\n\nA decentralized, peer-to-peer communication tool enabling encrypted text messaging and direct file transfers with zero intermediary servers.\n\n## HIGHLIGHTS:\n- WebRTC DataChannels for direct peer-to-peer transmission\n- Ephemeral WebSockets signaling via Node.js\n- Chunked direct browser-to-browser file transfers\n\n## TECH STACK:\nWebRTC, WebSockets, Node.js, React", 12, 5);
roomCText.position.set(0, 2.5, 9.9);
roomCText.rotation.y = Math.PI;
roomCGroup.add(roomCText);

const chatLink = createPedestalLink("https://quickchat.rokux9.com", "/models/satellite/scene.gltf", 0.8, "Live Demo");
chatLink.position.set(-5, 0, 5);
roomCGroup.add(chatLink);
chatLink.rotation.y = Math.PI * 0.75;

const chatRepo = createPedestalLink("https://github.com/RokuX9/QuickChat", "/models/github/scene.gltf", 0.8, "Github Repo");
chatRepo.position.set(5, 0, 5);
roomCGroup.add(chatRepo);
chatRepo.rotation.y = -Math.PI * 0.75;


// Collect updatables and interactables
const allLinks = [githubProfile, linkedinProfile, earthLink, roomARepo, newsLink, newsFrontRepo, newsBackRepo, chatLink, chatRepo];
allLinks.forEach(link => {
  updatables.push(link);
  // Add pedestal and floating group to interactables
  interactables.push(link.children[0]);
  interactables.push(link.children[1]);
  // Add pedestal mesh to colliders
  colliders.push(link.children[0]);
});

// VERY IMPORTANT: Update matrix world BEFORE exporting colliders so their bounding boxes compute correctly!
map.updateMatrixWorld(true);

export { map, colliders, portals, interactables, updatables };
