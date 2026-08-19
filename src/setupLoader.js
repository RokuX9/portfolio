import * as THREE from "three";

THREE.DefaultLoadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
  const progress = (itemsLoaded / itemsTotal) * 100;
  const bar = document.getElementById("loading-bar");
  const text = document.getElementById("loading-text");
  if (bar) bar.style.width = progress + "%";
  if (text) text.innerText = Math.round(progress) + "%";
};

THREE.DefaultLoadingManager.onLoad = function () {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }
};
