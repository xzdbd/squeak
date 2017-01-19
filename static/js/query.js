/* ========================================================================
 * Calcite Maps: query.js v0.1 (dojo)
 * ========================================================================
 * Query data from arcgis server services. Test.
 *
 * ======================================================================== */

require([
      // ArcGIS

      //dojo
      "dojo/query",
      "dojo/html",
      "dojo/dom",

      "dojo/domReady!"
    ], function(query, html, dom) {
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
        query(".dropdown-menu li a[data-target='#panelQuery']").on("click", function(e){
          console.log("click query widget.")      
        });

});