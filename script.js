/* ===================================================
   DrawPad [Dev Version] - Script Principal (script.js)
   =================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------
  // 1. COMPTE À REBOURS DU CONCOURS & OVERRIDE DEV DATE
  // ---------------------------------------------------
  const geminiAiBtn = document.getElementById("geminiAiBtn");
  const geminiFileInput = document.getElementById("geminiFileInput");

  const devMonth = document.getElementById("devMonth");
  const devYear = document.getElementById("devYear");
  const devDay = document.getElementById("devDay");
  const devHour = document.getElementById("devHour");
  const devMinute = document.getElementById("devMinute");
  const devSecond = document.getElementById("devSecond");

  function getSimulatedDate() {
    if (devYear && devMonth && devDay && devHour && devMinute && devSecond) {
      const year = parseInt(devYear.value, 10) || 2026;
      const month = parseInt(devMonth.value, 10); // 0-11
      const day = parseInt(devDay.value, 10) || 1;
      const hour = parseInt(devHour.value, 10) || 0;
      const minute = parseInt(devMinute.value, 10) || 0;
      const second = parseInt(devSecond.value, 10) || 0;

      return new Date(year, month, day, hour, minute, second).getTime();
    }
    return new Date().getTime();
  }

  function updateCountdownAndCheckAI() {
    // Mois 8 = Septembre, Mois 9 = Octobre (JavaScript utilise un index à partir de 0)
    const startDate = new Date(2026, 8, 30, 18, 0, 0).getTime();
    const endDate = new Date(2026, 9, 30, 18, 0, 0).getTime();
    
    const now = getSimulatedDate();
    const display = document.getElementById("countdownDisplay");
    
    const isContestActive = now >= startDate && now <= endDate;

    // BLOQUER/DÉBLOQUER LE BOUTON IA
    if (geminiAiBtn) {
      if (isContestActive) {
        geminiAiBtn.disabled = true;
        geminiAiBtn.classList.add("disabled");
        geminiAiBtn.setAttribute("title", "L'option IA est interdite pendant toute la durée du concours !");
      } else {
        geminiAiBtn.disabled = false;
        geminiAiBtn.classList.remove("disabled");
        geminiAiBtn.setAttribute("title", "Transformer photo en contour");
      }
    }

    if (!display) return;

    if (now < startDate) {
      const diff = startDate - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      display.textContent = `: ${days}j/${hours}h/${minutes}min/${seconds}s`;
    } else if (isContestActive) {
      display.textContent = ": Concours en cours ! 🔥";
    } else {
      display.textContent = ": Concours terminé ! 🎉";
    }
  }

  [devMonth, devYear, devDay, devHour, devMinute, devSecond].forEach((el) => {
    if (el) {
      el.addEventListener("change", updateCountdownAndCheckAI);
      el.addEventListener("input", updateCountdownAndCheckAI);
    }
  });

  setInterval(updateCountdownAndCheckAI, 1000);
  updateCountdownAndCheckAI();

  // ---------------------------------------------------
  // 2. ÉLÉMENTS DU DOM & INITIALISATION
  // ---------------------------------------------------
  const homeScreen = document.getElementById("homeScreen");
  const startBtn = document.getElementById("startBtn");
  const backToHomeBtn = document.getElementById("backToHomeBtn");

  const canvas = document.getElementById("paintCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const canvasContainer = document.getElementById("canvasContainer");

  const previewCanvas = document.getElementById("previewCanvas");
  const previewCtx = previewCanvas ? previewCanvas.getContext("2d") : null;

  // Galerie
  const openGalleryBtn = document.getElementById("openGalleryBtn");
  const galleryModal = document.getElementById("galleryModal");
  const closeGalleryBtn = document.getElementById("closeGalleryBtn");
  const galleryGrid = document.getElementById("galleryGrid");

  // Outils
  const brushTool = document.getElementById("brushTool");
  const handTool = document.getElementById("handTool");
  const bucketTool = document.getElementById("bucketTool");
  const eyedropperTool = document.getElementById("eyedropperTool");
  const eraserTool = document.getElementById("eraserTool");
  const textTool = document.getElementById("textTool");
  const clearCanvasBtn = document.getElementById("clearCanvas");
  const clearLayerBtn = document.getElementById("clearLayerBtn");

  // Contrôles
  const undoBtn = document.getElementById("undoBtn");
  const redoBtn = document.getElementById("redoBtn");
  const resetZoomBtn = document.getElementById("resetZoomBtn");
  const saveDrawingBtn = document.getElementById("saveDrawingBtn");
  const downloadBtn = document.getElementById("downloadBtn");

  // Sélecteur de couleur
  const colorPickerModal = document.getElementById("colorPickerModal");
  const openPickerFromTop = document.getElementById("openPickerFromTop");
  const closePickerBtn = document.getElementById("closePickerBtn");
  const currentColorDot = document.getElementById("currentColorDot");
  const topColorDot = document.getElementById("topColorDot");

  const satValCanvas = document.getElementById("satValCanvas");
  const satValCtx = satValCanvas ? satValCanvas.getContext("2d") : null;
  const satValContainer = document.getElementById("satValContainer");
  const pickerCursor = document.getElementById("pickerCursor");

  const hueContainer = document.getElementById("hueContainer");
  const hueHandle = document.getElementById("hueHandle");

  const sizeSliderContainer = document.getElementById("sizeSliderContainer");
  const pickerSizeInput = document.getElementById("pickerSizeInput");
  const sizeHandle = document.getElementById("sizeHandle");

  // ---------------------------------------------------
  // 3. ÉTAT DE L'APPLICATION
  // ---------------------------------------------------
  let currentTool = "brush";
  let currentColor = "#000000";
  let brushSize = 5;

  let currentHue = 0;
  let currentSat = 1;
  let currentVal = 0;

  let scale = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  const history = [];
  let historyStep = -1;
  const MAX_HISTORY = 20;

  // ---------------------------------------------------
  // 4. TAILLE DU CANVAS ET CENTRAGE ANCRÉ
  // ---------------------------------------------------
  function initCanvasSize() {
    canvas.width = 1080;
    canvas.height = 1920;

    canvas.style.display = "block";
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.transformOrigin = "0 0";
    canvas.style.boxShadow = "0 0 25px rgba(0,0,0,0.6)";

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (previewCanvas) {
      previewCanvas.width = 60;
      previewCanvas.height = 100;
    }

    saveHistory();
    updatePreview();
  }

  function centerCanvas() {
    let cW = canvasContainer ? canvasContainer.clientWidth : window.innerWidth;
    let cH = canvasContainer ? canvasContainer.clientHeight : window.innerHeight;

    if (cW <= 0) cW = window.innerWidth;
    if (cH <= 0) cH = window.innerHeight;

    const padding = 30;
    const availW = cW - padding * 2;
    const availH = cH - padding * 2;

    const scaleX = availW / canvas.width;
    const scaleY = availH / canvas.height;

    scale = Math.min(scaleX, scaleY);
    if (!scale || scale <= 0 || isNaN(scale)) scale = 0.3;

    panX = (cW - canvas.width * scale) / 2;
    panY = (cH - canvas.height * scale) / 2;

    applyTransform();
  }

  function applyTransform() {
    let cW = canvasContainer ? canvasContainer.clientWidth : window.innerWidth;
    let cH = canvasContainer ? canvasContainer.clientHeight : window.innerHeight;

    const minVisiblePixel = 120;
    const minPanX = -canvas.width * scale + minVisiblePixel;
    const maxPanX = cW - minVisiblePixel;
    const minPanY = -canvas.height * scale + minVisiblePixel;
    const maxPanY = cH - minVisiblePixel;

    panX = Math.min(Math.max(panX, minPanX), maxPanX);
    panY = Math.min(Math.max(panY, minPanY), maxPanY);

    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Assure la visibilité de l'accueil au départ
  if (homeScreen) homeScreen.style.display = "flex";

  // ---------------------------------------------------
  // 5. NAVIGATION & ÉVÉNEMENTS D'ACCUEIL
  // ---------------------------------------------------
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (homeScreen) homeScreen.style.display = "none";
      initCanvasSize();
      centerCanvas();
    });
  }

  if (backToHomeBtn) {
    backToHomeBtn.addEventListener("click", () => {
      if (homeScreen) homeScreen.style.display = "flex";
    });
  }

  window.addEventListener("resize", centerCanvas);

  if (resetZoomBtn) {
    resetZoomBtn.addEventListener("click", centerCanvas);
  }

  if (openGalleryBtn) {
    openGalleryBtn.addEventListener("click", () => {
      loadGallery();
      if (galleryModal) galleryModal.style.display = "flex";
    });
  }

  if (closeGalleryBtn) {
    closeGalleryBtn.addEventListener("click", () => {
      if (galleryModal) galleryModal.style.display = "none";
    });
  }

  // ---------------------------------------------------
  // 6. GESTION DES OUTILS
  // ---------------------------------------------------
  const tools = [
    { btn: brushTool, name: "brush" },
    { btn: handTool, name: "hand" },
    { btn: bucketTool, name: "bucket" },
    { btn: eyedropperTool, name: "eyedropper" },
    { btn: eraserTool, name: "eraser" },
    { btn: textTool, name: "text" }
  ];

  tools.forEach((t) => {
    if (!t.btn) return;
    t.btn.addEventListener("click", () => {
      if (t.name === "brush" && currentTool === "brush") {
        openColorPicker();
        return;
      }

      tools.forEach((other) => other.btn && other.btn.classList.remove("active"));
      t.btn.classList.add("active");
      currentTool = t.name;
    });
  });

  // ---------------------------------------------------
  // 7. SÉLECTEUR DE COULEUR ET ÉPAISSEUR
  // ---------------------------------------------------
  if (openPickerFromTop) openPickerFromTop.addEventListener("click", openColorPicker);
  if (closePickerBtn) {
    closePickerBtn.addEventListener("click", () => {
      if (colorPickerModal) colorPickerModal.style.display = "none";
    });
  }

  function openColorPicker() {
    if (colorPickerModal) colorPickerModal.style.display = "flex";
    drawSatValSquare();
    updatePickerUI();
  }

  function drawSatValSquare() {
    if (!satValCanvas || !satValContainer || !satValCtx) return;
    const w = (satValCanvas.width = satValContainer.clientWidth || 200);
    const h = (satValCanvas.height = satValContainer.clientHeight || 180);

    const baseColor = `hsl(${currentHue}, 100%, 50%)`;
    satValCtx.fillStyle = baseColor;
    satValCtx.fillRect(0, 0, w, h);

    const gradWhite = satValCtx.createLinearGradient(0, 0, w, 0);
    gradWhite.addColorStop(0, "rgba(255,255,255,1)");
    gradWhite.addColorStop(1, "rgba(255,255,255,0)");
    satValCtx.fillStyle = gradWhite;
    satValCtx.fillRect(0, 0, w, h);

    const gradBlack = satValCtx.createLinearGradient(0, 0, 0, h);
    gradBlack.addColorStop(0, "rgba(0,0,0,0)");
    gradBlack.addColorStop(1, "rgba(0,0,0,1)");
    satValCtx.fillStyle = gradBlack;
    satValCtx.fillRect(0, 0, w, h);
  }

  function updatePickerUI() {
    const hex = hsvToHex(currentHue, currentSat, currentVal);
    currentColor = hex;

    if (currentColorDot) currentColorDot.style.backgroundColor = hex;
    if (topColorDot) topColorDot.style.backgroundColor = hex;

    if (satValContainer && pickerCursor) {
      const w = satValContainer.clientWidth;
      const h = satValContainer.clientHeight;
      pickerCursor.style.left = `${currentSat * w}px`;
      pickerCursor.style.top = `${(1 - currentVal) * h}px`;
    }

    if (hueContainer && hueHandle) {
      const hueH = hueContainer.clientHeight;
      hueHandle.style.top = `${(currentHue / 360) * hueH}px`;
    }

    if (pickerSizeInput) pickerSizeInput.value = brushSize;
    updateSizeHandle();
  }

  function updateSizeHandle() {
    if (!sizeSliderContainer || !pickerSizeInput || !sizeHandle) return;
    const h = sizeSliderContainer.clientHeight;
    const val = pickerSizeInput.value;
    const max = pickerSizeInput.max;
    const pct = val / max;
    sizeHandle.style.top = `${(1 - pct) * (h - 10)}px`;
  }

  let isDraggingSatVal = false;
  if (satValContainer) {
    satValContainer.addEventListener("pointerdown", (e) => {
      isDraggingSatVal = true;
      handleSatValMove(e);
    });
  }

  window.addEventListener("pointermove", (e) => {
    if (isDraggingSatVal) handleSatValMove(e);
    if (isDraggingHue) handleHueMove(e);
  });

  window.addEventListener("pointerup", () => {
    isDraggingSatVal = false;
    isDraggingHue = false;
  });

  function handleSatValMove(e) {
    if (!satValContainer) return;
    const rect = satValContainer.getBoundingClientRect();
    let x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    currentSat = x / rect.width;
    currentVal = 1 - y / rect.height;

    updatePickerUI();
  }

  let isDraggingHue = false;
  if (hueContainer) {
    hueContainer.addEventListener("pointerdown", (e) => {
      isDraggingHue = true;
      handleHueMove(e);
    });
  }

  function handleHueMove(e) {
    if (!hueContainer) return;
    const rect = hueContainer.getBoundingClientRect();
    let y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    currentHue = (y / rect.height) * 360;

    drawSatValSquare();
    updatePickerUI();
  }

  if (pickerSizeInput) {
    pickerSizeInput.addEventListener("input", (e) => {
      brushSize = parseInt(e.target.value, 10);
      updateSizeHandle();
    });
  }

  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const hex = btn.getAttribute("data-color");
      setHexColor(hex);
    });
  });

  function setHexColor(hex) {
    currentColor = hex;
    const hsv = hexToHsv(hex);
    currentHue = hsv.h;
    currentSat = hsv.s;
    currentVal = hsv.v;

    drawSatValSquare();
    updatePickerUI();
  }

  // ---------------------------------------------------
  // 8. INTERACTION DESSIN ET DÉPLACEMENT
  // ---------------------------------------------------
  function getCanvasCoords(e) {
    const rect = canvasContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    return {
      x: (mouseX - panX) / scale,
      y: (mouseY - panY) / scale
    };
  }

  if (canvasContainer) {
    canvasContainer.addEventListener("pointerdown", (e) => {
      if (currentTool === "hand") {
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        return;
      }

      const pos = getCanvasCoords(e);

      if (currentTool === "brush" || currentTool === "eraser") {
        isDrawing = true;
        lastX = pos.x;
        lastY = pos.y;
        drawPoint(pos.x, pos.y);
      } else if (currentTool === "bucket") {
        floodFill(Math.round(pos.x), Math.round(pos.y), currentColor);
        saveHistory();
        updatePreview();
      } else if (currentTool === "eyedropper") {
        pickColor(Math.round(pos.x), Math.round(pos.y));
      } else if (currentTool === "text") {
        addTextPrompt(pos.x, pos.y);
      }
    });

    canvasContainer.addEventListener("pointermove", (e) => {
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        applyTransform();
        return;
      }

      if (!isDrawing) return;

      const pos = getCanvasCoords(e);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (currentTool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = brushSize * 2;
      } else {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
      }

      ctx.stroke();

      lastX = pos.x;
      lastY = pos.y;
    });

    canvasContainer.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
        const newScale = Math.min(Math.max(0.05, scale * zoomFactor), 8);

        const rect = canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        panX = mouseX - (mouseX - panX) * (newScale / scale);
        panY = mouseY - (mouseY - panY) * (newScale / scale);
        scale = newScale;

        applyTransform();
      },
      { passive: false }
    );
  }

  window.addEventListener("pointerup", () => {
    if (isDrawing) {
      isDrawing = false;
      saveHistory();
      updatePreview();
    }
    isPanning = false;
  });

  function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      (currentTool === "eraser" ? brushSize * 2 : brushSize) / 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
    ctx.fill();
  }

  // ---------------------------------------------------
  // 9. OUTILS SPÉCIAUX (Remplissage, Pipette, Texte)
  // ---------------------------------------------------
  function floodFill(startX, startY, fillHex) {
    if (startX < 0 || startX >= canvas.width || startY < 0 || startY >= canvas.height) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const fillRgb = hexToRgb(fillHex);
    const targetPos = (startY * canvas.width + startX) * 4;

    const startR = data[targetPos];
    const startG = data[targetPos + 1];
    const startB = data[targetPos + 2];
    const startA = data[targetPos + 3];

    if (
      startR === fillRgb.r &&
      startG === fillRgb.g &&
      startB === fillRgb.b &&
      startA === 255
    ) {
      return;
    }

    const pixelStack = [[startX, startY]];
    const width = canvas.width;
    const height = canvas.height;

    function matchStartColor(pos) {
      const r = data[pos];
      const g = data[pos + 1];
      const b = data[pos + 2];
      const a = data[pos + 3];

      return (
        Math.abs(r - startR) < 30 &&
        Math.abs(g - startG) < 30 &&
        Math.abs(b - startB) < 30 &&
        Math.abs(a - startA) < 30
      );
    }

    while (pixelStack.length) {
      const newPos = pixelStack.pop();
      const x = newPos[0];
      let y = newPos[1];

      let pixelPos = (y * width + x) * 4;

      while (y >= 0 && matchStartColor(pixelPos)) {
        y--;
        pixelPos -= width * 4;
      }

      pixelPos += width * 4;
      y++;

      let reachLeft = false;
      let reachRight = false;

      while (y < height && matchStartColor(pixelPos)) {
        data[pixelPos] = fillRgb.r;
        data[pixelPos + 1] = fillRgb.g;
        data[pixelPos + 2] = fillRgb.b;
        data[pixelPos + 3] = 255;

        if (x > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) {
            reachLeft = false;
          }
        }

        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) {
            reachRight = false;
          }
        }

        y++;
        pixelPos += width * 4;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function pickColor(x, y) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setHexColor(hex);

    tools.forEach((other) => other.btn && other.btn.classList.remove("active"));
    if (brushTool) brushTool.classList.add("active");
    currentTool = "brush";
  }

  function addTextPrompt(x, y) {
    const text = prompt("Entrez votre texte :");
    if (text) {
      ctx.fillStyle = currentColor;
      ctx.font = `${brushSize * 4 + 12}px sans-serif`;
      ctx.fillText(text, x, y);
      saveHistory();
      updatePreview();
    }
  }

  // ---------------------------------------------------
  // 10. IA & CONTOUR D'IMAGE
  // ---------------------------------------------------
  if (geminiAiBtn) {
    geminiAiBtn.addEventListener("click", () => {
      if (geminiAiBtn.disabled) return;
      if (geminiFileInput) geminiFileInput.click();
    });
  }

  if (geminiFileInput) {
    geminiFileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          processImageToContour(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function processImageToContour(img) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const width = canvas.width;
    const height = canvas.height;

    const grayscale = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] =
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const outputData = ctx.createImageData(width, height);
    const out = outputData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;

        const gx =
          -grayscale[idx - width - 1] +
          grayscale[idx - width + 1] -
          2 * grayscale[idx - 1] +
          2 * grayscale[idx + 1] -
          grayscale[idx + width - 1] +
          grayscale[idx + width + 1];

        const gy =
          -grayscale[idx - width - 1] -
          2 * grayscale[idx - width] -
          grayscale[idx - width + 1] +
          grayscale[idx + width - 1] +
          2 * grayscale[idx + width] +
          grayscale[idx + width + 1];

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const val = magnitude > 50 ? 0 : 255;

        const outIdx = idx * 4;
        out[outIdx] = val;
        out[outIdx + 1] = val;
        out[outIdx + 2] = val;
        out[outIdx + 3] = 255;
      }
    }

    ctx.putImageData(outputData, 0, 0);
    saveHistory();
    updatePreview();
  }

  // ---------------------------------------------------
  // 11. HISTORIQUE & EFFACEMENT
  // ---------------------------------------------------
  function saveHistory() {
    if (historyStep < history.length - 1) {
      history.splice(historyStep + 1);
    }

    if (history.length >= MAX_HISTORY) {
      history.shift();
    } else {
      historyStep++;
    }

    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      if (historyStep > 0) {
        historyStep--;
        ctx.putImageData(history[historyStep], 0, 0);
        updatePreview();
      }
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener("click", () => {
      if (historyStep < history.length - 1) {
        historyStep++;
        ctx.putImageData(history[historyStep], 0, 0);
        updatePreview();
      }
    });
  }

  if (clearCanvasBtn) clearCanvasBtn.addEventListener("click", clearCanvas);
  if (clearLayerBtn) clearLayerBtn.addEventListener("click", clearCanvas);

  function clearCanvas() {
    if (confirm("Voulez-vous vraiment effacer tout le dessin ?")) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveHistory();
      updatePreview();
    }
  }

  function updatePreview() {
    if (!previewCanvas || !previewCtx) return;
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.drawImage(
      canvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height
    );
  }

  // ---------------------------------------------------
  // 12. SAUVEGARDE LOCALE & GALERIE
  // ---------------------------------------------------
  if (saveDrawingBtn) {
    saveDrawingBtn.addEventListener("click", () => {
      const dataUrl = canvas.toDataURL("image/png");
      let drawings = JSON.parse(localStorage.getItem("drawpad_saved")) || [];
      drawings.unshift({ id: Date.now(), image: dataUrl });

      localStorage.setItem("drawpad_saved", JSON.stringify(drawings));
      alert("Dessin enregistré dans 'Mes dessins enregistrés' !");
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = `dessin-drawpad-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  function loadGallery() {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";
    let drawings = JSON.parse(localStorage.getItem("drawpad_saved")) || [];

    if (drawings.length === 0) {
      galleryGrid.innerHTML =
        '<p style="color:#aaa; grid-column:1/-1; text-align:center;">Aucun dessin enregistré pour le moment.</p>';
      return;
    }

    drawings.forEach((item) => {
      const card = document.createElement("div");
      card.className = "drawing-card";

      const img = document.createElement("img");
      img.src = item.image;

      const delBtn = document.createElement("button");
      delBtn.className = "delete-drawing-btn";
      delBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Supprimer';
      delBtn.onclick = () => {
        deleteDrawing(item.id);
      };

      card.appendChild(img);
      card.appendChild(delBtn);
      galleryGrid.appendChild(card);
    });
  }

  function deleteDrawing(id) {
    let drawings = JSON.parse(localStorage.getItem("drawpad_saved")) || [];
    drawings = drawings.filter((d) => d.id !== id);
    localStorage.setItem("drawpad_saved", JSON.stringify(drawings));
    loadGallery();
  }

  // ---------------------------------------------------
  // 13. CONVERSIONS DE COULEURS
  // ---------------------------------------------------
  function hsvToHex(h, s, v) {
    let r, g, b;
    let i = Math.floor((h / 60) % 6);
    let f = h / 60 - Math.floor(h / 60);
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }

    return rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    );
  }

  function hexToHsv(hex) {
    const rgb = hexToRgb(hex);
    let r = rgb.r / 255,
      g = rgb.g / 255,
      b = rgb.b / 255;

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h,
      s,
      v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
      h = 0;
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s, v: v };
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  function hexToRgb(hex) {
    let c = hex.replace("#", "");
    if (c.length === 3) {
      c = c
        .split("")
        .map((char) => char + char)
        .join("");
    }
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }
});
