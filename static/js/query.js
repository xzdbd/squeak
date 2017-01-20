/* ========================================================================
 * Calcite Maps: query.js v0.1 (dojo)
 * ========================================================================
 * Query data from arcgis server services. Test.
 *
 * ======================================================================== */

require([
      // ArcGIS
      "esri/tasks/QueryTask",
      "esri/tasks/support/Query",
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/PopupTemplate",
      
      //dojo
      "dojo/query",
      "dojo/html",
      "dojo/dom",

      "dojo/domReady!"
    ], function(QueryTask, Query, GraphicsLayer, Graphic, SimpleMarkerSymbol, PopupTemplate, query, html, dom) {

        var busGraphicsLayer = new GraphicsLayer();

        html.set(dom.byId("bus2-info-table"), '<tbody>' +
                  '<tr>' +
                    '<th>ID</th>' +
                    '<th>Name</th>' +
                  '</tr>' +
                  '<tr>' +
                    '<td>1</td>' +
                    '<td>Station1</td>' +
                  '</tr>' +
                  '</tbody>'
                  );
        
        html.set(query("#bus2-info-table")[0], '<tbody>' +
                  '<tr>' +
                    '<th>ID</th>' +
                    '<th>Name</th>' +
                  '</tr>' +
                  '<tr>' +
                    '<td>1</td>' +
                    '<td>Station1</td>' +
                  '</tr>' +
                  '</tbody>'
                  );

        query(".dropdown-menu li a[data-target='#panelQuery']").on("click", function(e){
          console.log("click query widget.")   
          
          
          var htmlTemplate = ""
             
          var buslayer = "https://gis.xzdbd.com/arcgis/rest/services/dev/bus/MapServer/0";
          var queryTask = new QueryTask({
            url: buslayer
          });
          var query1 = new Query();
          query1.returnGeometry = true;
          query1.outFields = ["Z______ID", "NAME", "KIND"];
          query1.where = "OBJECTID < 10";
          
          queryTask.execute(query1).then(function(result) {
            console.log(result.features);
            htmlTemplate = initGrid(result.features)
            result.features.forEach(function(graphic) {
              graphic.symbol = new SimpleMarkerSymbol({
                size: 10,
                color: "#FF4000",
                outline: {
                  color: [255, 64, 0, 0.4],
                  width: 7
                }
              });
              graphic.popupTemplate = new PopupTemplate({
                title: "Bus Station {NAME}",
                content: "ID: {Z______ID:StringFormat}"
              });

              busGraphicsLayer.add(graphic);
            });
            app.mapView.map.layers.add(busGraphicsLayer);
            html.set(query("#bus3-info-table")[0], htmlTemplate);
          }); //end of queryTask.execute
        
          

          function initGrid(features) {
            gridHtml = '<tbody>';
            gridHtml += '<tr>' +
                    '<th>ID</th>' +
                    '<th>Name</th>' +
                    '<th>Kind</th>' +
                    '</tr>';
            features.forEach(function(feature) {
              gridHtml += '<tr>' +
                    '<td>'+ feature.attributes.Z______ID + '</td>' +
                    '<td>'+ feature.attributes.NAME + '</td>' +
                    '<td>'+ feature.attributes.KIND + '</td>' +
                    '</tr>' ;
            });
            gridHtml += '</tbody>';
            return gridHtml;
          }
      });        

      query("#panelQuery").on("hide.bs.collapse", function(){
        app.mapView.map.layers.remove(busGraphicsLayer)
      });   

});