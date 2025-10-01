async function loadSingleUrlLivery(url) {
    if (!geofs || !geofs.aircraft || !geofs.aircraft.instance) {
        console.error("GeoFS aircraft instance not found.");
        return;
    }

    const aircraft = geofs.aircraft.instance;
    const def = aircraft.definition;
    const partsKeys = Object.keys(def.parts);
    const parts = partsKeys.map(k => parseInt(k));
    const textures = new Array(parts.length).fill(url);

    for (let i = 0; i < textures.length; i++) {
        const model3d = def.parts[parts[i]]['3dmodel'];
        if (!model3d) {
            console.warn(`Missing 3D model for part: ${parts[i]}`);
            continue;
        }
        try {
            if (geofs.version == 2.9) {
                geofs.api.Model.prototype.changeTexture(textures[i], aircraft.index[i] || 0, model3d);
            } else if (geofs.version >= 3.0 && geofs.version <= 3.7) {
                geofs.api.changeModelTexture(model3d._model, textures[i], aircraft.index[i] || 0);
            } else {
                geofs.api.changeModelTexture(model3d._model, textures[i], { index: aircraft.index[i] || 0 });
            }
        } catch (error) {
            geofs.api.notify("Error loading livery texture. See console.");
            console.error(error);
        }
    }
    console.log(`Loaded custom livery from URL: ${url}`);
}
 loadSingleUrlLivery('https://raw.githubusercontent.com/kolos26/GEOFS-LiverySelector/main/liveries/piper_cub/US-Army-Air-Corps.jpg');
