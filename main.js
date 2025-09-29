// Create a floating info box
let b = document.createElement("div");
b.style.position = "fixed";
b.style.top = "20px";
b.style.left = "20px";
b.style.padding = "10px";
b.style.background = "rgba(0,0,0,0.7)";
b.style.color = "white";
b.style.fontFamily = "system-ui";
b.style.fontSize = "14px";
b.style.borderRadius = "8px";
b.style.zIndex = "999999";
b.innerHTML = "Loading GeoFS data...";
document.body.appendChild(b);

// Function to update the info box
function updateInfo() {
    try {
        if (typeof geofs !== "undefined" && geofs.animation && geofs.animation.values) {
            let alt = (geofs.animation.values.altitude || 0).toFixed(1);
            let gs = (geofs.animation.values.groundSpeedKnt || 0).toFixed(1);
            let lat = (geofs.aircraft.instance.llaLocation[0] || 0).toFixed(5);
            let lon = (geofs.aircraft.instance.llaLocation[1] || 0).toFixed(5);

            let ws = (geofs.animation.values.windSpeed * 1.94384).toFixed(1); // m/s → kts
            let rel = geofs.animation.values.relativeWind || 0;
            let hdg = geofs.animation.values.heading360 || 0;

            let wd = ((rel + hdg + 360) % 360).toFixed(0); // True wind direction
            let wl = geofs.animation.values.windSpeedLabel || `${ws} kts`;

            b.innerHTML = `
                <b>GeoFS Info</b><br>
                Altitude: ${alt} ft<br>
                Ground Speed: ${gs} kts<br>
                Lat: ${lat}<br>
                Lon: ${lon}<br>
                Wind: ${wl} @ ${wd}°
            `;
        }
    } catch (e) {
        b.innerHTML = "Error reading GeoFS data";
    }
}

// Update the info box every second
setInterval(updateInfo, 1000);
