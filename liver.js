// === Custom Piper Cub livery tester with UI Frame ===
(function () {
  const aircraftID = 1; // Piper Cub
  const parts = [0];
  const indices = [3];

  // Default test livery
  const testLivery = "https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/main/liveries/piper_cub/NC29508_1.png";

  // --- UI Frame Setup ---
  const frame = document.createElement("div");
  frame.style.position = "fixed";
  frame.style.top = "20px";
  frame.style.right = "20px";
  frame.style.width = "300px";
  frame.style.maxHeight = "200px";
  frame.style.overflowY = "auto";
  frame.style.background = "rgba(0,0,0,0.8)";
  frame.style.color = "#fff";
  frame.style.fontFamily = "monospace";
  frame.style.fontSize = "12px";
  frame.style.padding = "10px";
  frame.style.borderRadius = "8px";
  frame.style.zIndex = 999999;
  frame.style.boxShadow = "0 0 10px rgba(0,0,0,0.6)";
  frame.innerHTML = `<b>Piper Cub Livery Tester</b><br><div id="cubLogs"></div><button id="copyLogs" style="margin-top:8px;width:100%;padding:4px;border:none;border-radius:4px;cursor:pointer;">📋 Copy Logs</button>`;
  document.body.appendChild(frame);

  const logBox = frame.querySelector("#cubLogs");
  const copyBtn = frame.querySelector("#copyLogs");
  let logs = [];

  function addLog(msg, isError = false) {
    const line = document.createElement("div");
    line.textContent = (isError ? "❌ " : "✅ ") + msg;
    line.style.color = isError ? "salmon" : "lightgreen";
    logBox.appendChild(line);
    logs.push(line.textContent);
    logBox.scrollTop = logBox.scrollHeight;
  }

  copyBtn.onclick = () => {
    navigator.clipboard.writeText(logs.join("\n"))
      .then(() => alert("Logs copied to clipboard!"));
  };

  // --- Apply Livery Function ---
  function applyCubLivery(textureUrl) {
    const inst = geofs.aircraft.instance;

    if (inst.id !== aircraftID) {
      addLog("Not flying the Piper Cub! Current ID: " + inst.id, true);
      return;
    }

    for (let i = 0; i < parts.length; i++) {
      const model3d = inst.definition.parts[parts[i]]["3dmodel"];
      if (!model3d) {
        addLog("Could not find model for part " + parts[i], true);
        continue;
      }

      try {
        geofs.api.changeModelTexture(model3d._model, textureUrl, { index: indices[i] });
        addLog("Applied livery: " + textureUrl);
      } catch (err) {
        addLog("Failed to apply livery: " + err.message, true);
      }
    }
  }

  // Run immediately with default livery
  applyCubLivery(testLivery);

  // Expose for re-use
  window.applyCubLivery = applyCubLivery;
})();
