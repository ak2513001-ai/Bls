(function(){
    if(!window.geofs || !geofs.aircraft || !geofs.aircraft.instance){
        alert("GeoFS aircraft not ready. Open GeoFS first!");
        return;
    }

    let aircraft = geofs.aircraft.instance;

    // Create a draggable log panel
    let logPanel = document.createElement("div");
    logPanel.style.position = "fixed";
    logPanel.style.bottom = "10px";
    logPanel.style.right = "10px";
    logPanel.style.width = "450px";
    logPanel.style.height = "250px";
    logPanel.style.background = "rgba(0,0,0,0.85)";
    logPanel.style.color = "lime";
    logPanel.style.fontFamily = "monospace";
    logPanel.style.overflow = "auto";
    logPanel.style.zIndex = "999999";
    logPanel.style.padding = "6px";
    logPanel.style.border = "1px solid lime";
    logPanel.style.cursor = "move";
    logPanel.innerHTML = "<b>Livery Change Logger</b><br><button id='liveryCopyBtn'>Copy Log</button><pre id='liveryLog' style='white-space: pre-wrap;'></pre>";
    document.body.appendChild(logPanel);

    let logBox = document.getElementById("liveryLog");
    function log(msg){
        console.log("[Livery Logger]", msg);
        logBox.textContent += msg + "\n";
        logBox.scrollTop = logBox.scrollHeight;
    }

    document.getElementById("liveryCopyBtn").onclick = function(){
        navigator.clipboard.writeText(logBox.textContent).then(()=>alert("Log copied!"))
        .catch(err=>alert("Copy failed: " + err));
    };

    // Drag functionality
    let isDragging=false, offsetX, offsetY;
    logPanel.addEventListener("mousedown", e=>{
        isDragging=true; offsetX=e.clientX-logPanel.getBoundingClientRect().left; offsetY=e.clientY-logPanel.getBoundingClientRect().top;
    });
    document.addEventListener("mousemove", e=>{if(isDragging){logPanel.style.left=(e.clientX-offsetX)+"px"; logPanel.style.top=(e.clientY-offsetY)+"px";}});
    document.addEventListener("mouseup", ()=>{if(isDragging){isDragging=false;}});

    // Proxy to watch aircraft instance property changes
    geofs.aircraft.instance = new Proxy(aircraft, {
        set(target, prop, value){
            log(`Aircraft property set: ${prop} = ${JSON.stringify(value)}`);
            target[prop] = value;
            return true;
        },
        get(target, prop){
            let val = target[prop];
            if(typeof val === "function"){
                return function(...args){
                    log(`Aircraft function called: ${prop}(${JSON.stringify(args)})`);
                    return val.apply(target, args);
                }
            }
            return val;
        }
    });

    log("Aircraft instance proxy created. All property changes and function calls will be logged.");

    // Monitor clicks in livery selector iframe if any
    let framesChecked=false;
    function checkFrames(){
        if(framesChecked) return;
        for(let i=0;i<window.frames.length;i++){
            try{
                let f=window.frames[i];
                if(f.document && f.document.body && f.document.body.innerText.toLowerCase().includes("livery")){
                    log("Livery selector iframe found; monitoring clicks...");
                    f.document.addEventListener("click", e=>{
                        let txt=e.target.innerText||e.target.value||"";
                        log("Livery UI click: "+txt);
                    });
                    framesChecked=true;
                }
            }catch(e){}
        }
    }
    setInterval(checkFrames,1000);
})();
