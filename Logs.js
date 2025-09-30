(function() {
    if (!geofs.aircraft.instance) {
        alert("Spawn an aircraft first!");
        return;
    }

    const plane = geofs.aircraft.instance;

    const frame = document.createElement("div");
    frame.style.position = "fixed";
    frame.style.bottom = "10px";
    frame.style.right = "10px";
    frame.style.width = "400px";
    frame.style.maxHeight = "300px";
    frame.style.overflowY = "auto";
    frame.style.background = "rgba(0,0,0,0.85)";
    frame.style.color = "white";
    frame.style.fontFamily = "monospace";
    frame.style.fontSize = "12px";
    frame.style.padding = "10px";
    frame.style.borderRadius = "8px";
    frame.style.zIndex = 9999;

    const title = document.createElement("div");
    title.innerText = `Aircraft Parts & Texture Slots (ID: ${plane.id})`;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "5px";
    frame.appendChild(title);

    const logContainer = document.createElement("div");
    frame.appendChild(logContainer);

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Copy Logs";
    copyBtn.style.marginTop = "5px";
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(logContainer.innerText);
        alert("Logs copied to clipboard!");
    };
    frame.appendChild(copyBtn);

    document.body.appendChild(frame);

    function logMsg(msg) {
        const p = document.createElement("div");
        p.innerText = msg;
        logContainer.appendChild(p);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    const parts = plane.definition.parts;
    logMsg(`Aircraft Name: ${plane.definition.name || "Unknown"}`);
    logMsg(`Total parts: ${parts.length}`);

    parts.forEach((part, i) => {
        if (!part['3dmodel'] || !part['3dmodel']._model) {
            logMsg(`Part ${i}: ${part.name || "Unnamed"} - 3D model not loaded yet`);
            return;
        }
        const textures = part['3dmodel']._model.textures || [];
        const indices = textures.map((_, idx) => idx); // list of available texture indexes
        logMsg(`Part ${i}: ${part.name || "Unnamed"} - Texture slots: ${textures.length} - Indexes: [${indices.join(", ")}]`);
    });
})();
