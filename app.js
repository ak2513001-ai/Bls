(function(){
    // Create draggable log panel
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
    logPanel.innerHTML = "<b>Flight Plan Full Logger</b><br><button id='fpCopyBtn'>Copy Log</button><pre id='fpLog' style='white-space: pre-wrap;'></pre>";
    document.body.appendChild(logPanel);

    let logBox = document.getElementById("fpLog");
    function log(msg){
        console.log("[GeoFS FP Logger]", msg);
        logBox.textContent += msg + "\n";
        logBox.scrollTop = logBox.scrollHeight;
    }

    document.getElementById("fpCopyBtn").onclick = function(){
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

    // Hook all functions in geofs.flightPlan
    if(window.geofs && geofs.flightPlan){
        Object.keys(geofs.flightPlan).forEach(fn=>{
            if(typeof geofs.flightPlan[fn]==="function"){
                let orig = geofs.flightPlan[fn];
                geofs.flightPlan[fn] = function(...args){
                    log(`flightPlan.${fn} called with: ${JSON.stringify(args)}`);
                    return orig.apply(this,args);
                }
            }
        });
        log("All flightPlan functions hooked.");
    } else {
        log("geofs.flightPlan not ready yet.");
    }

    // Proxy to watch property changes
    if(window.geofs && geofs.flightPlan){
        geofs.flightPlan = new Proxy(geofs.flightPlan,{
            set(target, prop, value){
                log(`flightPlan property set: ${prop} = ${JSON.stringify(value)}`);
                target[prop] = value;
                return true;
            },
            get(target, prop){
                return target[prop];
            }
        });
        log("FlightPlan properties are now being watched.");
    }

    // Watch NAV1 for route changes
    if(window.geofs && geofs.nav && geofs.nav.units && geofs.nav.units.NAV1){
        geofs.nav.units.NAV1 = new Proxy(geofs.nav.units.NAV1,{
            set(target, prop, value){
                if(["route","activeWaypoint"].includes(prop)){
                    log(`NAV1.${prop} changed: ${JSON.stringify(value)}`);
                }
                target[prop] = value;
                return true;
            },
            get(target, prop){
                return target[prop];
            }
        });
        log("NAV1 route changes are now being watched.");
    }

    // Monitor clicks in Flight Plan iframe
    let framesChecked=false;
    function checkFrames(){
        if(framesChecked) return;
        for(let i=0;i<window.frames.length;i++){
            try{
                let f=window.frames[i];
                if(f.document && f.document.body && f.document.body.innerText.includes("Flight Plan")){
                    log("Flight plan iframe found; monitoring clicks...");
                    f.document.addEventListener("click", e=>{
                        let txt=e.target.innerText||e.target.value||"";
                        log("Flight Plan UI click: "+txt);
                    });
                    framesChecked=true;
                }
            }catch(e){}
        }
    }
    setInterval(checkFrames,1000);

})();
