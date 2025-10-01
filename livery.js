<!-- UI HTML from part 3 -->
<div class="livery-searchbar mdl-textfield mdl-js-textfield geofs-stopMousePropagation geofs-stopKeyupPropagation">
    <input class="mdl-textfield__input address-input" type="text" placeholder="Search liveries" onkeyup="LiverySelector.search(this.value)" id="searchlivery">
    <label class="mdl-textfield__label" for="searchlivery">Search liveries</label>
</div>

<h6 onclick="LiverySelector.toggleDiv('favorites')">Favorite liveries</h6>
<ul id="favorites" class="geofs-list geofs-visible"></ul>

<h6 onclick="LiverySelector.toggleDiv('liverylist')">Available liveries</h6>
<ul id="liverylist" class="geofs-list geofs-visible"></ul>

<h6 onclick="LiverySelector.toggleDiv('customDiv')" class="closed">Load external livery</h6>
<div id="customDiv" class="mdl-textfield mdl-js-textfield geofs-stopMousePropagation geofs-stopKeyupPropagation" style="display:none;">
    <ul class="livery-custom-tabs" onclick="LiverySelector.handleCustomTabs()">
        <li>Upload</li>
        <li>Direct</li>
        <li>Download</li>
        <li>API</li>
    </ul>
    <div id="livery-custom-tab-upload" style="display:none;">
        <div>Paste URL or upload image to generate imgbb URL</div>
        <div class="upload-fields"></div>
        <div><button class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="LiverySelector.inputLivery()">Load livery</button></div>
    </div>
    <div id="livery-custom-tab-direct" style="display:none;">
        <div>Load texture directly in client, no upload.</div>
        <div class="upload-fields"></div>
    </div>
</div>

<br/>
<a href="https://cdn.jsdelivr.net/gh/kolos26/GEOFS-LiverySelector@main/tutorial.txt" target="_blank"><button class="mdl-button mdl-js-button mdl-button--raised mdl-button">Open tutorial</button></a><br/>

<!-- The button to open the livery panel - from part 3 -->
<script>
function createTag(name, attributes = {}, content = '') {
    const el = document.createElement(name);
    Object.keys(attributes).forEach(k => el.setAttribute(k, attributes[k]));
    if (content.length) el.innerHTML = content;
    return el;
}

function generatePanelButtonHTML() {
    const liveryButton = createTag('button', {
        title: 'Change livery',
        id: 'liverybutton',
        onclick: 'LiverySelector.togglePanel()',
        class: 'mdl-button mdl-js-button geofs-f-standard-ui geofs-mediumScreenOnly',
        'data-toggle-panel': '.livery-list',
        'data-tooltip-classname': 'mdl-tooltip--top',
        'data-upgraded': ',MaterialButton'
    });
    liveryButton.innerHTML = createTag('img', { src: `${noCommit}/liveryselector-logo-small.svg`, height: '30px' }).outerHTML;
    return liveryButton;
}

// Insert the button in the UI
const geofsUiButton = document.querySelector('.geofs-ui-bottom');
const insertPos = geofs.version >= 3.6 ? 4 : 3;
geofsUiButton.insertBefore(generatePanelButtonHTML(), geofsUiButton.children[insertPos]);

const noCommit = 'https://cdn.jsdelivr.net/gh/kolos26/GEOFS-LiverySelector@main'

// Core functions from part 1 & 2
function loadLivery(texture, index, parts) {
    for (let i = 0; i < texture.length; i++) {
        const model3d = geofs.aircraft.instance.definition.parts[parts[i]]['3dmodel'];
        try {
            if (geofs.version == 2.9) {
                geofs.api.Model.prototype.changeTexture(texture[i], index[i], model3d);
            } else if (geofs.version >= 3.0 && geofs.version <= 3.7) {
                geofs.api.changeModelTexture(model3d._model, texture[i], index[i]);
            } else {
                geofs.api.changeModelTexture(model3d._model, texture[i], { index: index[i] });
            }
        } catch (error) {
            geofs.api.notify("Cannot find this livery, check the console for details.");
            console.error(error);
        }
    }
}

function inputLivery() {
    const airplane = getCurrentAircraft();
    const textures = airplane.liveries[0].texture;
    const inputFields = document.getElementsByName('textureInput');
    if (textures.filter(x => x === textures[0]).length === textures.length) {
        const texture = inputFields[0].value;
        loadLivery(Array(textures.length).fill(texture), airplane.index, airplane.parts);
    } else {
        const texture = [];
        inputFields.forEach(e => texture.push(e.value));
        loadLivery(texture, airplane.index, airplane.parts);
    }
}

function getCurrentAircraft() {
    return liveryobj.aircrafts[geofs.aircraft.instance.id];
}

function toggleDiv(id) {
    const div = document.getElementById(id);
    const target = window.event.target;
    if (target.classList.contains('closed')) {
        target.classList.remove('closed');
        div.style.display = '';
    } else {
        target.classList.add('closed');
        div.style.display = 'none';
    }
}

function togglePanel() {
    const p = document.getElementById('listDiv');
    if (p.dataset.ac != geofs.aircraft.instance.id) {
        window.LiverySelector.listLiveries();
    }
}

window.LiverySelector = {
    loadLivery,
    inputLivery,
    toggleDiv,
    getCurrentAircraft,
    togglePanel,
    search: function() {},
    handleCustomTabs: function() {},
};
</script>
