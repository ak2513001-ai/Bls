(function(){
    let logPanel = document.createElement("div");
    logPanel.style.position = "fixed";
    logPanel.style.bottom = "10px";
    logPanel.style.right = "10px";
    logPanel.style.width = "420px";
    logPanel.style.height = "220px";
    logPanel.style.background = "rgba(0,0,0,0.85)";
    logPanel.style.color = "lime";
    logPanel.style.fontFamily = "monospace";
    logPanel.style.overflow = "auto";
    logPanel.style.zIndex = "999999";
    logPanel.style.padding = "6px";
    logPanel.innerHTML = "<b>Recording GeoFS Flight Plan activity...</b><br><button id='fpCopyBtn'>Copy Log</button><pre id='fpLog' style='white-space: pre-wrap;'></pre>";
    document.body.appendChild(logPanel);

    let logBox = document.getElementById("fpLog");

    function log(msg){
        console.log("[GeoFS Recorder]", msg);
        logBox.textContent += msg + "\n";
        logBox.scrollTop = logBox.scrollHeight;
    }

    // Copy button handler
    document.getElementById("fpCopyBtn").onclick = function(){
        navigator.clipboard.writeText(logBox.textContent).then(()=>{
            alert("Log copied to clipboard!");
        }).catch(err=>{
            alert("Copy failed: " + err);
        });
    };

    // Try to hook geofs.flightPlan functions if present
    if (window.geofs && geofs.flightPlan) {
        for (let k in geofs.flightPlan) {
            if (typeof geofs.flightPlan[k] === "function") {
                let orig = geofs.flightPlan[k];
                geofs.flightPlan[k] = function(){
                    log("flightPlan."+k+" called with args: "+JSON.stringify(arguments));
                    return orig.apply(this, arguments);
                }
            }
        }
        log("Hooked geofs.flightPlan methods.");
    } else {
        log("geofs.flightPlan not ready. Try opening the Flight Plan panel.");
    }

    // Try to monitor iframe with flight plan UI
    let framesChecked = false;
    function checkFrames(){
        if (framesChecked) return;
        for (let i=0;i<window.frames.length;i++){
            try {
                let f = window.frames[i];
                if (f.document && f.document.body && f.document.body.innerText.includes("Flight Plan")) {
                    log("Found flight plan iframe. Listening for clicks...");
                    f.document.addEventListener("click", e=>{
                        log("Click inside Flight Plan UI: "+(e.target.innerText||e.target.value));
                    });
                    framesChecked = true;
                }
            } catch(e){}
        }
    }
    setInterval(checkFrames,1000);

})();
