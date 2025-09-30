(function(){
    if(!window.geofs || !geofs.aircraft || !geofs.aircraft.instance){
        alert("GeoFS aircraft not ready. Open GeoFS first!");
        return;
    }

    let aircraft = geofs.aircraft.instance;

    // Create draggable log panel
    let logPanel = document.createElement("div");
    logPanel.style.position = "fixed";
    logPanel.style.bottom = "10px";
    logPanel.style.right = "10px";
    logPanel.style.width = "500px";
    logPanel.style.height = "300px";
    logPanel.style.background = "rgba(0,0,0,0.85)";
    logPanel.style.color = "lime";
    logPanel.style.fontFamily = "monospace";
    logPanel.style.overflow = "auto";
    logPanel.style.zIndex = "999999";
    logPanel.style.padding = "6px";
    logPanel.style.border = "1px solid lime";
    logPanel.style.cursor = "move";
    logPanel.innerHTML = "<b>Livery Live Inspector</b><br><button id='liveryCopyBtn'>Copy Log</button><div id='liveryProps' style='white-space: pre-wrap;'></div>";
    document.body.appendChild(logPanel);

    let propsBox = document.getElementById("liveryProps");

    // Drag functionality
    let isDragging=false, offsetX, offsetY;
    logPanel.addEventListener("mousedown", e=>{
        isDragging=true; offsetX=e.clientX-logPanel.getBoundingClientRect().left; offsetY=e.clientY-logPanel.getBoundingClientRect().top;
    });
    document.addEventListener("mousemove", e=>{if(isDragging){logPanel.style.left=(e.clientX-offsetX)+"px"; logPanel.style.top=(e.clientY-offsetY)+"px";}});
    document.addEventListener("mouseup", ()=>{if(isDragging){isDragging=false;}});

    // Store current property values
    let currentProps = {};

    // Function to render all tracked properties
    function renderProps(){
        let html = "";
        for(let k in currentProps){
            html += `<b>${k}</b>: ${JSON.stringify(currentProps[k])}<br>`;
        }
        propsBox.innerHTML = html;
    }

    document.getElementById("liveryCopyBtn").onclick = function(){
        navigator.clipboard.writeText(propsBox.innerText).then(()=>alert("Log copied!"))
        .catch(err=>alert("Copy failed: " + err));
    };

    // Proxy to watch aircraft instance property changes
    geofs.aircraft.instance = new Proxy(aircraft, {
        set(target, prop, value){
            currentProps[prop] = value;
            renderProps();
            target[prop] = value;
            return true;
        },
        get(target, prop){
            let val = target[prop];
            if(typeof val === "function"){
                return function(...args){
                    currentProps[prop] = `[Function called with: ${JSON.stringify(args)}]`;
                    renderProps();
                    return val.apply(target,args);
                }
            }
            return val;
        }
    });

    // Monitor clicks in livery selector iframe if any
    let framesChecked=false;
    function checkFrames(){
        if(framesChecked) return;
        for(let i=0;i<window.frames.length;i++){
            try{
                let f=window.frames[i];
                if(f.document && f.document.body && f.document.body.innerText.toLowerCase().includes("livery")){
                    f.document.addEventListener("click", e=>{
                        let txt=e.target.innerText||e.target.value||"";
                        currentProps["Last UI Click"] = txt;
                        renderProps();
                    });
                    framesChecked=true;
                }
            }catch(e){}
        }
    }
    setInterval(checkFrames,1000);

    console.log("Livery Live Inspector active: properties dynamically update in panel.");
})();
