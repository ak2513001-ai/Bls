(function(){
    if(!window.geofs || !geofs.flightPlan){
        alert("GeoFS or geofs.flightPlan not ready. Open GeoFS first!");
        return;
    }

    // Create a hidden file input
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.onchange = function(event){
        let file = event.target.files[0];
        if(!file) return;

        let reader = new FileReader();
        reader.onload = function(e){
            try{
                let jsonData = JSON.parse(e.target.result);
                geofs.flightPlan.import(jsonData);
                alert("Flight plan imported successfully!");
            }catch(err){
                alert("Failed to read JSON file: "+err);
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    // Trigger file picker
    fileInput.click();
})();
