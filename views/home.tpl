<!DOCTYPE html>
<html>
<head>
    <title>map</title>
    <script src="https://code.jquery.com/jquery-1.11.2.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ol3/3.7.0/ol.css" type="text/css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ol3/3.7.0/ol.js"></script>

</head>
<body>
<div class="container-fluid">

    <div class="row-fluid">
        <div class="span12">
            <div id="map" class="map"></div>
        </div>
    </div>

</div>
<script>
    var url = 'http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer';

    var layers = [
        new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'sat'})
        }),
        new ol.layer.Tile({
            extent: [-13884991, 2870341, -7455066, 6338219],
            source: new ol.source.TileArcGISRest({
                url: url
            })
        })
    ];
    var map = new ol.Map({
        layers: layers,
        target: 'map',
        view: new ol.View({
            center: [-10997148, 4569099],
            zoom: 4
        })
    });

</script>
</body>
</html>