/* ========================================================================
 * pollution main.js
 * ========================================================================
 *
   ======================================================================== */

var app;

    require([
      // ArcGIS
      "esri/Map",
      "esri/Basemap",
      "esri/layers/VectorTileLayer",
      "esri/views/MapView",
      "esri/views/SceneView",
      "esri/widgets/Search",
      "esri/widgets/Popup",
      "esri/widgets/Home",
      "esri/widgets/Legend",
      "esri/widgets/ColorPicker",
      "esri/core/watchUtils",
      "esri/layers/FeatureLayer",
      "esri/layers/MapImageLayer",
      "dojo/query",
      "dojo/dom-class",
      "dojo/dom",
      "dojo/on",
      "dojo/dom-construct",

      // Boostrap
      "bootstrap/Collapse", 
      "bootstrap/Dropdown",
      "bootstrap/Tab",
      "bootstrap/Carousel",
      "bootstrap/Tooltip",
      "bootstrap/Modal",

      // Dojo
      "dojo/domReady!"
    ], function(Map, Basemap, VectorTileLayer, MapView, SceneView, Search, Popup, Home, Legend, ColorPicker, 
      watchUtils, FeatureLayer, MapImageLayer, query, domClass, dom, on, domConstruct) {
      
      app = {
        scale: 1155581,
        lonlat: [119.98970031737869,29.75321096797822],
        mapView: null, 
        mapDiv: "mapViewDiv",
        mapFL: null,
        vectorLayer: null,
        sceneView: null, 
        sceneDiv: "sceneViewDiv",
        sceneFL: null,
        activeView: null,
        searchWidgetNav: null, 
        searchWidgetPanel: null, 
        searchWidgetSettings: null,
        basemapSelected: "gray",
        basemapSelectedAlt: "gray",
        legendLayer: null,
        legend: null,
        padding: { 
          top: 85 ,
          right: 0,
          bottom: 0,
          left: 0
        }, 
        uiPadding: { 
          components:["zoom", "attribution", "home", "compass"],
          padding: {
            top: 15,
            right: 15,
            bottom: 30,
            left: 15
          }
        },
        popupOptions: {
          autoPanEnabled: true,
          messageEnabled: false,
          spinnerEnabled: false,
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: true,
            breakpoint: 544 // default
          }
        },
        colorPickerWidget: null,
      }

      //----------------------------------
      // App
      //----------------------------------

      initializeMapViews();
      initializeAppUI();


      //----------------------------------
      // Map and Scene View
      //----------------------------------

      function initializeMapViews() {
          app.mapView = new MapView({
            container: app.mapDiv,
            map: new Map( {basemap: app.basemapSelected, constraints: { snapToZoom: false } } ),
            scale: app.scale,
            center: app.lonlat, 
            padding: app.padding,
            ui: app.uiPadding, 
            popup: new Popup(app.popupOptions),
            visible: true
          })

          app.activeView = app.mapView;

          app.mapView.then(function() {
            var mapImageLayer = new MapImageLayer({
              url: "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer"
            });
            app.mapView.map.add(mapImageLayer);
            
            var template = {
              title: "<font color='#008000'>监测站：{name}",

              content: [{
                type: "fields",
                fieldInfos: [{
                  fieldName: "code", 
                  visible: true,
                  label: "站点编码",
                  format: {
                    places: 0,
                    digitSeparator: true
                  }
                }, {
                  fieldName: "name", 
                  visible: true,
                  label: "站点名称",
                  format: {
                    places: 0,
                    digitSeparator: true
                  }
                }, {
                  fieldName: "area", 
                  visible: true,
                  label: "所在城市",
                  format: {
                    places: 0,
                    digitSeparator: true
                  },       
                  }
                ]
              }, {
                type: "text",
                text: "当前AQI值：{aqi}"
              }]
            };

            var monitorFeatureLayer = new FeatureLayer({
                  url: "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer/0",
                  outFields: ["*"],
                  popupTemplate: template
            });
            app.mapView.map.add(monitorFeatureLayer);

            var legend = new Legend({
              view: app.mapView,
              //container: query(".calcite-legend-container")[0],
              layerInfos: [{
                layer: mapImageLayer,
                title: "图例"
              }],
              visible: true
            });
            //app.mapView.ui.add(legend, "bottom-right");
            app.legend = legend;
            setTimeout(setLegendEvents, 2000);
          });
      }

      //----------------------------------
      // App UI Handlers
      //----------------------------------

      function initializeAppUI() {
        // App UI
        setBasemapEvents();
        setSearchWidgets();
        setPopupPanelEvents();
        setPopupEvents();
        setResultContentEvents();  
      }
      
      //----------------------------------
      // Basemaps
      //----------------------------------

      function setBasemapEvents() {

        // Sync basemaps for map and scene
        query("#selectBasemapPanel").on("change", function(e){
          app.basemapSelected = e.target.options[e.target.selectedIndex].dataset.vector;
          setBasemaps();               
        });

        function setBasemaps() {
          app.mapView.map.basemap = app.basemapSelected;
        } 
      }

      //----------------------------------
      // Search Widgets
      //----------------------------------

      function setSearchWidgets() {
        
        //TODO - Search Nav + Panel (detach/attach)
        app.searchWidgetNav = createSearchWidget("searchNavDiv", true);
        app.searchWidgetPanel = createSearchWidget("searchPanelDiv", true);
        app.searchWidgetSettings = createSearchWidget("settingsSearchDiv", false);

         // Create widget
        function createSearchWidget(parentId, showPopup) {
          var search = new Search({
            viewModel: {
              view: app.activeView,
              popupOpenOnSelect: showPopup,
              highlightEnabled: false,
              maxSuggestions: 4
            },
            }, parentId);
          search.startup();
          return search;
        } 
      }

      //----------------------------------
      // Popups and Panels
      //----------------------------------

      function setPopupPanelEvents() {

        // Views - Listen to view size changes to show/hide panels
        app.mapView.watch("size", viewSizeChange);

        function viewSizeChange(screenSize) {
          if (app.screenWidth !== screenSize[0]) {
            app.screenWidth = screenSize[0];
            setPanelVisibility();
          }
        }

        // Popups - Listen to popup changes to show/hide panels
        app.mapView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);

        // Panels - Show/hide the panel when popup is docked
        function setPanelVisibility() {
           var isMobileScreen = app.activeView.widthBreakpoint === "xsmall" || app.activeView.widthBreakpoint === "small",
            isDockedVisible = app.activeView.popup.visible && app.activeView.popup.currentDockPosition,
            isDockedBottom = app.activeView.popup.currentDockPosition && app.activeView.popup.currentDockPosition.indexOf("bottom") > -1;
          // Mobile (xsmall/small)
          if (isMobileScreen) {
            if (isDockedVisible && isDockedBottom) {
              query(".calcite-panels").addClass("invisible");
            } else {
              query(".calcite-panels").removeClass("invisible");
            }
          } else { // Desktop (medium+)
            if (isDockedVisible) {
              query(".calcite-panels").addClass("invisible");
            } else {
              query(".calcite-panels").removeClass("invisible");          
            }
          }
        }

        // Panels - Dock popup when panels show (desktop or mobile)
        query(".calcite-panels .panel").on("show.bs.collapse", function(e) {
          if (app.activeView.popup.currentDockPosition || app.activeView.widthBreakpoint === "xsmall") {
            app.activeView.popup.dockEnabled = false;
          }
        });

        // Panels - Undock popup when panels hide (mobile only)
        query(".calcite-panels .panel").on("hide.bs.collapse", function(e) {
          if (app.activeView.widthBreakpoint === "xsmall") {
            app.activeView.popup.dockEnabled = true;
          }
        });
      }

      //----------------------------------
      // Popup collapse (optional)
      //----------------------------------

      function setPopupEvents() {      
        query(".esri-popup__header-title").on("click", function(e){
          query(".esri-popup__main-container").toggleClass("esri-popup-collapsed");
          app.activeView.popup.reposition();
        }.bind(this));
      }

      //----------------------------------
      // Result Content
      //----------------------------------
      function setResultContentEvents() {
        query(".calcite-div-toggle").on("click", function(e) {
          // open, to close
          if (domClass.contains(e.currentTarget, "calcite-div-toggle-bottom")) {
            domClass.replace(e.currentTarget, "calcite-div-toggle-zero-bottom", "calcite-div-toggle-bottom");
            domClass.replace(query(".calcite-div-toggle .down-arrow")[0], "up-arrow", "down-arrow");
            domClass.replace(query(".calcite-div-content-info")[0], "calcite-div-content-info-collapse", "calcite-div-content-info");
            domClass.remove(query(".calcite-legend-box")[0], "calcite-legend-box-up");
          } else if (domClass.contains(e.currentTarget, "calcite-div-toggle-zero-bottom")) {
            domClass.replace(e.currentTarget, "calcite-div-toggle-bottom", "calcite-div-toggle-zero-bottom");
            domClass.replace(query(".calcite-div-toggle .up-arrow")[0], "down-arrow", "up-arrow");
            domClass.replace(query(".calcite-div-content-info-collapse")[0], "calcite-div-content-info", "calcite-div-content-info-collapse");
            domClass.add(query(".calcite-legend-box")[0], "calcite-legend-box-up");
          }            
        });
      }

      //----------------------------------
      // Legent events
      //----------------------------------
      function setLegendEvents() {
        app.legend.layerInfos[0].layer.then(function () {
            console.log("legend info");
            var legendContentNode = domConstruct.create("div", {
                className: "calcite-legend-content"
            }, query(".calcite-legend-container")[0]);

            app.legend.activeLayerInfos.items[0].legendElements.forEach(function(element) {
                if (element.type == "symbol-table") {
                    var legendListNode = domConstruct.create("div", {
                        className: "calcite-legend-list"
                    }, legendContentNode);

                    var legendNode = domConstruct.create("div", {
                        className: "calcite-legend"
                    }, legendListNode);
                    var symbolNode = domConstruct.create("img", {
                        src: element.infos[0].src,
                        style: "width:" + element.infos[0].width + ";" + "height:" + element.infos[0].height
                    }, legendNode);
                    
                    var labelNode = domConstruct.create("div", {
                        className: "calcite-legend-label",
                        innerHTML: element.title
                    }, legendListNode);
                }
            }, this);
            //var symbolNode = domConstruct.create("img", {
            //    src: app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].src,
            //    style: "width:" + app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].width + ";" + "height:" + app.legend.activeLayerInfos.items[0].legendElements[0].infos[0].height
            //}, legendNode);
        });
      } 
      

    });