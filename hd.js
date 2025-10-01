(function(){
    window.geofsNewHDState = true;
    window.geofs.geoIpUpdate = function() {
        delete window.geofs.api.analytics;
        document.body.classList.add("geofs-hd");
        window.geofs.api.imageryProvider = new Cesium.UrlTemplateImageryProvider({
            maximumLevel: 21,
            hasAlphaChannel: false,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        });
        window.geofs.api.setImageryProvider(window.geofs.api.imageryProvider, false);
        window.geofs.api.viewer.terrainProvider = window.geofs.api.flatRunwayTerrainProviderInstance = new geofs.api.FlatRunwayTerrainProvider({
            baseProvider: new Cesium.CesiumTerrainProvider({
                url: "https://data.geo-fs.com/srtm/",
                requestWaterMask: false,
                requestVertexNormals: true
            }),
            bypass: false,
            maximumLevel: 12
        });
    };
    window.executeOnEventDone("geofsStarted", function() {
        if (window.geofs.api.hdOn === window.geofsNewHDState) return;
        $("body").trigger("terrainProviderWillUpdate");
        window.geofs.geoIpUpdate();
        window.geofs.api.hdOn = window.geofsNewHDState;
        window.geofs.api.renderingQuality();
        $("body").trigger("terrainProviderUpdate");
        var removeAds = function() {
            document.querySelectorAll("iframe[src*='ads'],iframe[src*='doubleclick'],iframe[src*='googlesyndication']").forEach(function(ad){ad.remove()});
            document.querySelectorAll("div[id^='google_ads'],ins.adsbygoogle,#ads,#adContainer,#ad-banner,.ad-container,.banner-ads%22").forEach(function(ad){ad.style.display='none'});
        };
        removeAds();
        setInterval(removeAds, 3000);
    });
    window.executeOnEventDone("afterDeferredload", function() {
        window.geofs.mapXYZ = "https://data.geo-fs.com/osm/{z}/{x}/{y}.png";
    });
})();
