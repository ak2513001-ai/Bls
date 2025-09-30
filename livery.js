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

function loadLivery(textureURL, parts, index, targetAircraft = geofs.aircraft.instance) {
    for (let i = 0; i < parts.length; i++) {
        try {
            if (geofs.version == 2.9) geofs.api.Model.prototype.changeTexture(textureURL, index[i], targetAircraft.definition.parts[parts[i]]['3dmodel']);
            else geofs.api.changeModelTexture(targetAircraft.definition.parts[parts[i]]['3dmodel']._model, textureURL, index[i]);
        } catch(e){}
    }
    if (targetAircraft === geofs.aircraft.instance) multiplayertexture = textureURL;
}

function checkAircraft() {
    const currentId = geofs.aircraft.instance?.id;
    if (!currentId || currentId === lastAircraft) return;
    lastAircraft = currentId;
    if (autoLiveries[currentId]) {
        const entry = autoLiveries[currentId];
        loadLivery(entry.texture, entry.parts, entry.index);
    }
}

function patchMultiplayer() {
    const origAddAircraft = geofs.multiplayer.addAircraft;
    geofs.multiplayer.addAircraft = function(data) {
        const plane = origAddAircraft.apply(this, arguments);
        try {
            if (autoLiveries[data.aircraft]) {
                const entry = autoLiveries[data.aircraft];
                loadLivery(entry.texture, entry.parts, entry.index, plane);
            }
        } catch(e){}
        return plane;
    };
}

setInterval(checkAircraft, 1000);

const wait = setInterval(() => {
    if (geofs?.multiplayer?.addAircraft) {
        clearInterval(wait);
        patchMultiplayer();
    }
}, 1000);
