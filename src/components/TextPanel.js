import * as THREE from "three";

export const createTextPanel = (text, width = 5, height = 3) => {
  const canvas = document.createElement("canvas");
  // Use high resolution for crisp text
  const res = 256;
  canvas.width = width * res;
  canvas.height = height * res;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Border (removed per user request)

  // Text setup
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  // Word wrapping
  const baseFontSize = 60;
  const titleFontSize = baseFontSize * 1.5;
  const subFontSize = baseFontSize * 1.25;
  
  // Split text by newlines first
  const paragraphs = text.split('\n');
  const lines = []; // array of { text, fontSize }

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push({ text: '', fontSize: baseFontSize });
      continue;
    }
    
    let currentFontSize = baseFontSize;
    let textToProcess = paragraph;

    if (paragraph.startsWith('# ')) {
      currentFontSize = titleFontSize;
      textToProcess = paragraph.substring(2);
    } else if (paragraph.startsWith('## ')) {
      currentFontSize = subFontSize;
      textToProcess = paragraph.substring(3);
    }
    
    ctx.font = `bold ${currentFontSize}px sans-serif`;
    const words = textToProcess.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testWidth = ctx.measureText(currentLine + " " + word).width;
      if (testWidth < canvas.width - 100) {
        currentLine += " " + word;
      } else {
        lines.push({ text: currentLine, fontSize: currentFontSize });
        currentLine = word;
      }
    }
    lines.push({ text: currentLine, fontSize: currentFontSize });
  }

  // Calculate total height
  let totalHeight = 0;
  for (const line of lines) {
    totalHeight += line.fontSize * 1.5;
  }

  let startY = (canvas.height - totalHeight) / 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    ctx.font = `bold ${line.fontSize}px sans-serif`;
    const lineStep = line.fontSize * 1.5;
    if (line.text.trim() !== '') {
      ctx.fillText(line.text, canvas.width / 2, startY + (lineStep / 2));
    }
    startY += lineStep;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const geometry = new THREE.PlaneGeometry(width, height);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1 // Using alphaTest is much better for sorting issues than just transparent: true
  });

  const panel = new THREE.Mesh(geometry, material);
  return panel;
};
