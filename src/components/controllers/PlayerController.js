import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export class PlayerController {
  constructor(camera, domElement, moveSpeed = 10, sprintMult = 1.5) {
    this.controller = new PointerLockControls(camera, domElement);
    this.moveSpeed = moveSpeed;
    this.sprintMult = sprintMult;
    this.camera = camera
    this.moveState = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    };

    this.colliders = [];
    this.portals = [];
    this.interactables = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(0, 0);
    this.hoveredObject = null;
    this.playerRadius = 0.5;

    this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || ('ontouchstart' in window);
    this.joystick = { x: 0, y: 0 };

    this._createCrosshair();
    this._initListeners(domElement);

    if (this.isMobile) {
      this._initMobileUI();
    }
  }

  setColliders(colliders) {
    this.colliders = colliders.map(c => new THREE.Box3().setFromObject(c));
  }

  setPortals(portals) {
    this.portals = portals;
  }

  setInteractables(interactables) {
    this.interactables = interactables;
  }

  _initMobileUI() {
    // Joystick container
    const joyContainer = document.createElement("div");
    joyContainer.style.position = "absolute";
    joyContainer.style.bottom = "30px";
    joyContainer.style.left = "30px";
    joyContainer.style.width = "120px";
    joyContainer.style.height = "120px";
    joyContainer.style.borderRadius = "50%";
    joyContainer.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    joyContainer.style.border = "2px solid rgba(255, 255, 255, 0.5)";
    joyContainer.style.zIndex = "1000";
    joyContainer.style.touchAction = "none";
    document.body.appendChild(joyContainer);

    // Joystick stick
    const stick = document.createElement("div");
    stick.style.position = "absolute";
    stick.style.top = "50%";
    stick.style.left = "50%";
    stick.style.width = "50px";
    stick.style.height = "50px";
    stick.style.borderRadius = "50%";
    stick.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    stick.style.transform = "translate(-50%, -50%)";
    stick.style.pointerEvents = "none";
    joyContainer.appendChild(stick);

    const maxRadius = 35;
    let joystickId = null;

    joyContainer.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joystickId = touch.identifier;
      this._updateJoystick(touch, joyContainer, stick, maxRadius);
    }, { passive: false });

    joyContainer.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickId) {
          this._updateJoystick(e.changedTouches[i], joyContainer, stick, maxRadius);
        }
      }
    }, { passive: false });

    const endJoystick = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joystickId) {
          joystickId = null;
          this.joystick.x = 0;
          this.joystick.y = 0;
          stick.style.transform = "translate(-50%, -50%)";
        }
      }
    };
    joyContainer.addEventListener("touchend", endJoystick);
    joyContainer.addEventListener("touchcancel", endJoystick);
  }

  _updateJoystick(touch, container, stick, maxRadius) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    stick.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    this.joystick.x = dx / maxRadius;
    this.joystick.y = dy / maxRadius;
  }

  _createCrosshair() {
    const crosshair = document.createElement("div");
    crosshair.style.position = "absolute";
    crosshair.style.top = "50%";
    crosshair.style.left = "50%";
    crosshair.style.width = "4px";
    crosshair.style.height = "4px";
    crosshair.style.backgroundColor = "white";
    crosshair.style.borderRadius = "50%";
    crosshair.style.transform = "translate(-50%, -50%)";
    crosshair.style.pointerEvents = "none";
    crosshair.style.zIndex = "100";
    document.body.appendChild(crosshair);
    this.crosshair = crosshair;
  }

  _initListeners(domElement) {
    domElement.addEventListener("click", () => {
      if (this.hoveredObject) {
        // Handle click on interactable regardless of lock state
        const url = this.hoveredObject.userData.url;
        if (url) {
          window.open(url, '_blank');
        }
      } else if (!this.controller.isLocked) {
        // Lock pointer only if background is clicked
        this.controller.lock();
      }
    });

    window.addEventListener("mousemove", (event) => {
      if (!this.controller.isLocked) {
        // Calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      } else {
        // If locked, mouse is conceptually at the center
        this.mouse.x = 0;
        this.mouse.y = 0;
      }
    });

    window.addEventListener("wheel", (event) => {
      if (!this.controller.isLocked) {
        // Spin the camera left or right
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.setFromQuaternion(this.camera.quaternion);
        euler.y -= event.deltaY * 0.002;
        this.camera.quaternion.setFromEuler(euler);
      }
    });

    let lookTouchId = null;
    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchMoved = false;

    domElement.addEventListener("touchstart", (e) => {
      if (e.target !== domElement) return; // Ignore joystick touches
      e.preventDefault();
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (lookTouchId === null) {
          lookTouchId = e.changedTouches[i].identifier;
          lastTouchX = e.changedTouches[i].clientX;
          lastTouchY = e.changedTouches[i].clientY;
          touchMoved = false;
          
          this.mouse.x = (lastTouchX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(lastTouchY / window.innerHeight) * 2 + 1;
          break;
        }
      }
    }, { passive: false });

    domElement.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          const touch = e.changedTouches[i];
          const dx = touch.clientX - lastTouchX;
          const dy = touch.clientY - lastTouchY;
          
          if (Math.abs(dx) > 2 || Math.abs(dy) > 2) touchMoved = true;

          const euler = new THREE.Euler(0, 0, 0, 'YXZ');
          euler.setFromQuaternion(this.camera.quaternion);
          euler.y -= dx * 0.005;
          euler.x -= dy * 0.005;
          euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
          this.camera.quaternion.setFromEuler(euler);

          lastTouchX = touch.clientX;
          lastTouchY = touch.clientY;
          
          this.mouse.x = (lastTouchX / window.innerWidth) * 2 - 1;
          this.mouse.y = -(lastTouchY / window.innerHeight) * 2 + 1;
        }
      }
    }, { passive: false });

    const endLook = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === lookTouchId) {
          if (!touchMoved && this.hoveredObject) {
            const url = this.hoveredObject.userData.url;
            if (url) window.open(url, '_blank');
          }
          lookTouchId = null;
        }
      }
    };
    
    domElement.addEventListener("touchend", endLook);
    domElement.addEventListener("touchcancel", endLook);

    window.addEventListener("keydown", (e) => this._onKeyChange(e.code, true));
    window.addEventListener("keyup", (e) => this._onKeyChange(e.code, false));
  }

  _onKeyChange(code, isPressed) {
    switch (code) {
      case "KeyW":
        this.moveState.forward = isPressed;
        break;
      case "KeyS":
        this.moveState.backward = isPressed;
        break;
      case "KeyA":
        this.moveState.left = isPressed;
        break;
      case "KeyD":
        this.moveState.right = isPressed;
        break;
      case "ShiftLeft":
        this.moveState.sprint = isPressed;
        break;
    }
  }

  _checkCollision(position) {
    // Simple AABB collision for the player (treating player as a box)
    // We shrink the box by 0.1 so touching a wall edge doesn't block sliding/teleporting
    const playerBox = new THREE.Box3();
    playerBox.setFromCenterAndSize(position, new THREE.Vector3(this.playerRadius * 2 - 0.1, 2, this.playerRadius * 2 - 0.1));

    for (const box of this.colliders) {
      if (playerBox.intersectsBox(box)) {
        return true;
      }
    }

    return false;
  }

  update(delta) {
    const speed = this.moveSpeed * delta * (this.moveState.sprint ? this.sprintMult : 1);

    // We get the camera direction
    const camera = this.camera;
    
    // Always keep matrixWorld updated in case of wheel/touch look
    camera.updateMatrixWorld(true);

    // Handle Interaction Raycasting
    this.raycaster.setFromCamera(this.mouse, camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);
    
    let currentHover = null;
    if (intersects.length > 0 && intersects[0].distance < 10) {
      // Find the parent with userData
      let object = intersects[0].object;
      while (object && !object.userData.isInteractable) {
        object = object.parent;
      }
      if (object && object.userData.isInteractable) {
        currentHover = object;
      }
    }

    if (this.hoveredObject !== currentHover) {
      if (this.hoveredObject) {
        // Reset scale
        const target = this.hoveredObject.userData.linkedGroup || this.hoveredObject;
        const baseScale = target.userData.baseScale || 1;
        target.scale.set(baseScale, baseScale, baseScale);
        this.crosshair.style.transform = "translate(-50%, -50%) scale(1)";
        this.crosshair.style.backgroundColor = "white";
      }
      this.hoveredObject = currentHover;
      if (this.hoveredObject) {
        // Grow scale
        const target = this.hoveredObject.userData.linkedGroup || this.hoveredObject;
        const baseScale = target.userData.baseScale || 1;
        const newScale = baseScale * 1.25;
        target.scale.set(newScale, newScale, newScale);
        this.crosshair.style.transform = "translate(-50%, -50%) scale(2)";
        this.crosshair.style.backgroundColor = "cyan";
      }
    }

    if (!this.controller.isLocked && !this.isMobile) return;

    const direction = new THREE.Vector3();
    this.controller.getDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(direction, camera.up).normalize();

    const moveVector = new THREE.Vector3();
    
    if (this.isMobile) {
      moveVector.addScaledVector(direction, -this.joystick.y);
      moveVector.addScaledVector(right, this.joystick.x);
    } else {
      if (this.moveState.forward) moveVector.add(direction);
      if (this.moveState.backward) moveVector.sub(direction);
      if (this.moveState.right) moveVector.add(right);
      if (this.moveState.left) moveVector.sub(right);
    }

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(speed);
    }

    const oldPos = camera.position.clone();

    // Apply X movement
    if (moveVector.x !== 0) {
      camera.position.x += moveVector.x;
      if (this._checkCollision(camera.position)) {
        camera.position.x = oldPos.x; // Revert X
      }
    }

    // Apply Z movement
    if (moveVector.z !== 0) {
      camera.position.z += moveVector.z;
      if (this._checkCollision(camera.position)) {
        camera.position.z = oldPos.z; // Revert Z
      }
    }

    // Update camera matrix so teleport math uses the latest position
    camera.updateMatrixWorld(true);
    
    // Portal Teleportation Logic
    const newPos = camera.position.clone();

    for (const portal of this.portals) {
      if (!portal.destinationPortal) continue;

      const oldLocal = portal.worldToLocal(oldPos.clone());
      const newLocal = portal.worldToLocal(newPos.clone());

      if (Math.abs(newLocal.x) <= 5 && newLocal.y >= -5 && newLocal.y <= 5) {
        // Did we just cross the portal plane?
        if (oldLocal.z >= 0 && newLocal.z < 0) {
          const dest = portal.destinationPortal;
          const destMatrix = dest.matrixWorld.clone();
          
          // Map local position to destination portal
          const localPos = newLocal.clone();
          // Because we crossed, local.z is negative.
          // Rotating by 180 degrees around Y flips X and Z
          const rotationY180 = new THREE.Matrix4().makeRotationY(Math.PI);
          destMatrix.multiply(rotationY180);

          const srcInverse = portal.matrixWorld.clone().invert();

          const newMatrix = destMatrix.multiply(srcInverse).multiply(camera.matrixWorld);

          newMatrix.decompose(camera.position, camera.quaternion, camera.scale);
          
          // Important: Update matrix world again so other systems (like portal rendering)
          // use the new teleported position immediately!
          camera.updateMatrixWorld(true);

          // Re-update oldLocal if needed, or just break as we crossed a portal
          break;
        }
      }
    }
  }
}
