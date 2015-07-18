<!DOCTYPE html>
<html>
<head>
    <meta charset=utf-8 />
    <title>Switching basemaps</title>
    <meta name='viewport' content='initial-scale=1,maximum-scale=1,user-scalable=no' />

    <script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
    <link rel="stylesheet" type="text/css" href="/static/css/semantic.min.css">
    <script src="/static/js/semantic.min.js"></script>

    <!-- Load Leaflet from CDN-->
    <link rel="stylesheet" href="//cdn.jsdelivr.net/leaflet/0.7.3/leaflet.css" />
    <script src="//cdn.jsdelivr.net/leaflet/0.7.3/leaflet.js"></script>

    <!-- Load Esri Leaflet from CDN -->
    <script src="//cdn.jsdelivr.net/leaflet.esri/1.0.0/esri-leaflet.js"></script>

    <style>
        body { margin:0; padding:0; }
        #map { position: absolute; top:0; bottom:0; right:0; left:0; }
    </style>
</head>
<body>

<style>
    #basemaps-wrapper {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        background: white;
        padding: 10px;
    }
    #basemaps {
        margin-bottom: 5px;
    }
</style>

<!--<div id="map"></div>-->
<div class="ui menu">
    <a class="item">
        Home
    </a>
    <div class="ui pointing dropdown link item">
        <span class="text">Query</span>
        <i class="dropdown icon"></i>
        <div class="menu">
            <div class="header">Categories</div>
            <div class="item">Query1</div>
            <div class="item">Query2</div>
            <div class="divider"></div>
            <div class="header">Order</div>
            <div class="item">Query3</div>
            <div class="item">Query4</div>
        </div>
    </div>
    <a class="item">
        Forums
    </a>
    <a class="item">
        Contact Us
    </a>
</div>
<div id="basemaps-wrapper" class="leaflet-bar">
    <select name="basemaps" id="basemaps" class="ui dropdown">
        <option value="Topographic">Topographic</option>
        <option value="Streets">Streets</option>
        <option value="NationalGeographic">National Geographic</option>
        <option value="Oceans">Oceans</option>
        <option value="Gray">Gray</option>
        <option value="DarkGray">Dark Gray</option>
        <option value="Imagery">Imagery</option>
        <option value="ShadedRelief">Shaded Relief</option>
    </select>
</div>

<script>
    $('.dropdown')
            .dropdown()
    ;

    var map = L.map('map').setView([-33.87, 150.77], 10);
    var layer = L.esri.basemapLayer('Topographic').addTo(map);
    var layerLabels;

    function setBasemap(basemap) {
        if (layer) {
            map.removeLayer(layer);
        }
        layer = L.esri.basemapLayer(basemap);
        map.addLayer(layer);
        if (layerLabels) {
            map.removeLayer(layerLabels);
        }

        if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {

            layerLabels = L.esri.basemapLayer(basemap + 'Labels');
            map.addLayer(layerLabels);
        }
    }

    var basemaps = document.getElementById('basemaps');

    basemaps.addEventListener('change', function(){
        setBasemap(basemaps.value);
    });
</script>

</body>
</html>