import * as THREE from "three";

const createMaterial = (color, map) => {
  return new THREE.MeshStandardMaterial({
    color: color || 0xffffff,
    map: map || null,
  });
};

export const createWideHall = (materials) => {
  const room = new THREE.Group();
  const defaultMaterial = createMaterial(0xffdddd);
  
  const floorMat = materials?.floor || defaultMaterial;
  const wallMat = materials?.wall || defaultMaterial;
  const ceilingMat = materials?.ceiling || defaultMaterial;

  const westGeo = new THREE.BoxGeometry(2, 7, 44);
  const westWall = new THREE.Mesh(westGeo, wallMat);
  westWall.position.set(-11, 2.5, 0); 
  room.add(westWall);

  const northGeo = new THREE.BoxGeometry(24, 7, 2);
  const northWall = new THREE.Mesh(northGeo, wallMat);
  northWall.position.set(0, 2.5, -21); 
  room.add(northWall);

  const southGeo = new THREE.BoxGeometry(24, 7, 2);
  const southWall = new THREE.Mesh(southGeo, wallMat);
  southWall.position.set(0, 2.5, 21); 
  room.add(southWall);

  const east1Geo = new THREE.BoxGeometry(2, 7, 7);
  const eastWall1 = new THREE.Mesh(east1Geo, wallMat);
  eastWall1.position.set(11, 2.5, -18.5); 
  room.add(eastWall1);

  const east2Geo = new THREE.BoxGeometry(2, 7, 10);
  const eastWall2 = new THREE.Mesh(east2Geo, wallMat);
  eastWall2.position.set(11, 2.5, 0); 
  room.add(eastWall2);

  const east3Geo = new THREE.BoxGeometry(2, 7, 7);
  const eastWall3 = new THREE.Mesh(east3Geo, wallMat);
  eastWall3.position.set(11, 2.5, 18.5); 
  room.add(eastWall3);

  const floorGeo = new THREE.BoxGeometry(24, 2, 44);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -1, 0);
  room.add(floor);

  const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
  ceiling.position.set(0, 6, 0);
  room.add(ceiling);

  return room;
};

export const createCubeRoom = (materials) => {
  const room = new THREE.Group();
  const defaultMaterial = createMaterial(0xddddff);
  
  const floorMat = materials?.floor || defaultMaterial;
  const wallMat = materials?.wall || defaultMaterial;
  const ceilingMat = materials?.ceiling || defaultMaterial;

  const southGeo = new THREE.BoxGeometry(24, 7, 2);
  const southWall = new THREE.Mesh(southGeo, wallMat);
  southWall.position.set(0, 2.5, 11);

  const westGeo = new THREE.BoxGeometry(2, 7, 24);
  const westWall = new THREE.Mesh(westGeo, wallMat);
  westWall.position.set(-11, 2.5, 0);

  const northLeftGeo = new THREE.BoxGeometry(7, 7, 2);
  const northWallLeft = new THREE.Mesh(northLeftGeo, wallMat);
  northWallLeft.position.set(-8.5, 2.5, -11);

  const northRightGeo = new THREE.BoxGeometry(7, 7, 2);
  const northWallRight = new THREE.Mesh(northRightGeo, wallMat);
  northWallRight.position.set(8.5, 2.5, -11);

  const eastLeftGeo = new THREE.BoxGeometry(2, 7, 7);
  const eastWallLeft = new THREE.Mesh(eastLeftGeo, wallMat);
  eastWallLeft.position.set(11, 2.5, -8.5);

  const eastRightGeo = new THREE.BoxGeometry(2, 7, 7);
  const eastWallRight = new THREE.Mesh(eastRightGeo, wallMat);
  eastWallRight.position.set(11, 2.5, 8.5);

  const floorGeo = new THREE.BoxGeometry(24, 2, 24);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -1, 0);

  const ceiling = new THREE.Mesh(floorGeo, ceilingMat);
  ceiling.position.set(0, 6, 0);

  room.add(
    southWall, westWall,
    northWallLeft, northWallRight,
    eastWallLeft, eastWallRight,
    floor, ceiling
  );
  return room;
};
