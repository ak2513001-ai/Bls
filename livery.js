const autoLiveries = {
    "1": {
        texture: [
            { url: "https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/main/liveries/piper_cub/US-Army-Air-Corps.jpg" }
        ],
        parts: [0,0,0,0],
        index: [0,1,2,3],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    },
    "320": {
        texture: [
            { url: "https://raw.githubusercontent.com/yourRepo/yourPath/a320-livery.png" }
        ],
        parts: [0,0,0],
        index: [0,1,2],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    },
    "737": {
        texture: [
            { url: "https://raw.githubusercontent.com/yourRepo/yourPath/b737-livery.png" }
        ],
        parts: [0,0,0,0],
        index: [0,1,2,3],
        mp: [{ modelIndex: 0, textureIndex: 0 }]
    }
};

let lastAircraft = null;
let multiplayertexture = null;

function loadLivery(textures, parts, index, targetAircraft = geofs.aircraft.instance) {
    for (let i = 0; i < parts.length; i++) {
        try {
            const model3d = targetAircraft.definition.parts[parts[i]]['3dmodel'];
            const textureObj = textures[i];
            if (geofs.version == 2.9) 
                geofs.api.Model.prototype.changeTexture(textureObj.url, index[i], model3d);
            else 
                geofs.api.changeModelTexture(model3d._model, textureObj.url, index[i]);
        } catch (e) {
            alert("Error applying texture: " + e);
        }
    }
    if (targetAircraft === geofs.aircraft.instance) multiplayertexture = textures.map(t => t.url);
}

function checkAircraft() {
    const currentId = geofs.aircraft.instance?.id;
    if (!currentId || currentId === lastAircraft) return;
    lastAircraft = currentId;
    if (autoLiveries[currentId]) {
        const entry = autoLiveries[currentId];
        const textures = Array(entry.index.length).fill(entry.texture[0]);
        loadLivery(textures, entry.parts, entry.index);
    }
}

function patchMultiplayer() {
    const origAddAircraft = geofs.multiplayer.addAircraft;
    geofs.multiplayer.addAircraft = function(data) {
        const plane = origAddAircraft.apply(this, arguments);
        try {
            if (autoLiveries[data.aircraft]) {
                const entry = autoLiveries[data.aircraft];
                const textures = Array(entry.index.length).fill(entry.texture[0]);
                loadLivery(textures, entry.parts, entry.index, plane);
            }
        } catch (e) {
            alert("Error applying multiplayer livery: " + e);
        }
        return plane;
    };
}

setInterval(checkAircraft, 1000);

const wait = setInterval(() => {
    if (geofs?.multiplayer?.addAircraft) {
        clearInterval(wait);
        patchMultiplayer();
        alert("Auto-livery multiplayer patch active");
    }
}, 1000);
