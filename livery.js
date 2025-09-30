const autoLiveries = {
    "1": {
        texture: "https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/main/liveries/piper_cub/US-Army-Air-Corps.jpg",
        parts: [3],
        index: [0],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    },
    "320": {
        texture: "https://raw.githubusercontent.com/yourRepo/yourPath/a320-livery.png",
        parts: [0,0,0],
        index: [0,1,2],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    },
    "737": {
        texture: "https://raw.githubusercontent.com/yourRepo/yourPath/b737-livery.png",
        parts: [0,0,0,0],
        index: [0,1,2,3],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    }
};

let lastAircraft = null;
let multiplayertexture = null;

const frame = document.createElement("div");
frame.style.position = "fixed";
frame.style.bottom = "10px";
frame.style.right = "10px";
frame.style.width = "300px";
frame.style.maxHeight = "200px";
frame.style.overflowY = "auto";
frame.style.background = "rgba(0,0,0,0.8)";
frame.style.color = "white";
frame.style.fontFamily = "monospace";
frame.style.fontSize = "12px";
frame.style.padding = "10px";
frame.style.borderRadius = "8px";
frame.style.zIndex = 9999;

const title = document.createElement("div");
title.innerText = "AutoLivery Console";
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
};
frame.appendChild(copyBtn);

document.body.appendChild(frame);

function logMsg(msg) {
    const p = document.createElement("div");
    p.innerText = msg;
    logContainer.appendChild(p);
    logContainer.scrollTop = logContainer.scrollHeight;
}

function loadLivery(textureURL, parts, index, targetAircraft = geofs.aircraft.instance) {
    let success = true;
    for (let i = 0; i < parts.length; i++) {
        try {
            if (geofs.version == 2.9) geofs.api.Model.prototype.changeTexture(textureURL, index[i], targetAircraft.definition.parts[parts[i]]['3dmodel']);
            else geofs.api.changeModelTexture(targetAircraft.definition.parts[parts[i]]['3dmodel']._model, textureURL, index[i]);
        } catch(e){
            success = false;
            logMsg(`[AutoLivery] Failed on part/index: ${parts[i]}/${index[i]}: ${e}`);
        }
    }
    if (targetAircraft === geofs.aircraft.instance) multiplayertexture = textureURL;
    return success;
}

function checkAircraft() {
    const currentId = geofs.aircraft.instance?.id;
    if (!currentId || currentId === lastAircraft) return;
    lastAircraft = currentId;
    if (autoLiveries[currentId]) {
        const entry = autoLiveries[currentId];
        const applied = loadLivery(entry.texture, entry.parts, entry.index);
        if (applied) logMsg(`[AutoLivery] Success: Livery applied for aircraft ID ${currentId}`);
        else logMsg(`[AutoLivery] Error: Livery failed for aircraft ID ${currentId}`);
    }
}

function patchMultiplayer() {
    const origAddAircraft = geofs.multiplayer.addAircraft;
    geofs.multiplayer.addAircraft = function(data) {
        const plane = origAddAircraft.apply(this, arguments);
        try {
            if (autoLiveries[data.aircraft]) {
                const entry = autoLiveries[data.aircraft];
                const applied = loadLivery(entry.texture, entry.parts, entry.index, plane);
                if (applied) logMsg(`[AutoLivery] Multiplayer livery applied for aircraft ID ${data.aircraft}`);
                else logMsg(`[AutoLivery] Multiplayer livery failed for aircraft ID ${data.aircraft}`);
            }
        } catch(e){}
        return plane;
    };
}

logMsg("[AutoLivery] Script loaded and running");

setInterval(checkAircraft, 1000);

const wait = setInterval(() => {
    if (geofs?.multiplayer?.addAircraft) {
        clearInterval(wait);
        patchMultiplayer();
        logMsg("[AutoLivery] Multiplayer patch active");
    }
}, 1000);
