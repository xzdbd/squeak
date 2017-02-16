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
  "esri/symbols/PictureMarkerSymbol",
  "esri/tasks/QueryTask",
  "esri/tasks/support/Query",
  "esri/layers/GraphicsLayer",

  "dojo/query",
  "dojo/dom-class",
  "dojo/dom",
  "dojo/on",
  "dojo/dom-construct",
  "dojo/date",
  "dojo/date/locale",
  "dojo/request",

  //cedar chart
  "cedar",

  // Calcite Maps
  "calcite-maps/calcitemaps-v0.3",

  // Boostrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Carousel",
  "bootstrap/Tooltip",
  "bootstrap/Modal",

  // Dojo
  "dojo/domReady!"
], function (Map, Basemap, VectorTileLayer, MapView, SceneView, Search, Popup, Home, Legend, ColorPicker,
  watchUtils, FeatureLayer, MapImageLayer, PictureMarkerSymbol, QueryTask, Query, GraphicsLayer, query, domClass, dom, on, domConstruct, date, locale, request, Cedar, CalciteMapsSettings) {

    app = {
      scale: 1155581,
      lonlat: [119.98970031737869, 29.75321096797822],
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
      basemapSelected: "topo",
      basemapSelectedAlt: "topo",
      legendLayer: null,
      legend: null,
      padding: {
        top: 85,
        right: 0,
        bottom: 0,
        left: 0
      },
      uiPadding: {
        components: ["zoom", "attribution", "home", "compass"],
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
    initializeStationLayer();
    initializeAppUI();


    //----------------------------------
    // Map and Scene View
    //----------------------------------

    function initializeMapViews() {
      app.mapView = new MapView({
        container: app.mapDiv,
        map: new Map({ basemap: app.basemapSelected, constraints: { snapToZoom: false } }),
        scale: app.scale,
        center: app.lonlat,
        padding: app.padding,
        ui: app.uiPadding,
        popup: new Popup(app.popupOptions),
        visible: true
      })

      app.activeView = app.mapView;

      app.mapView.then(function () {
        var mapImageLayer = new MapImageLayer({
          url: "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer"
        });
        //app.mapView.map.add(mapImageLayer);

        var template = {
          title: "<font color='#008000'>监测站：{hangzhouPollutionStation.name}",

          content: [{
            type: "fields",
            fieldInfos: [{
              fieldName: "squeakdb.public.view_latest_pollution.aqi",
              visible: true,
              label: "AQI",
              format: {
                places: 0,
                digitSeparator: true
              },
            }, {
              fieldName: "squeakdb.public.view_latest_pollution.quality",
              visible: true,
              label: "当前空气质量",
            }, {
              fieldName: "squeakdb.public.view_latest_pollution.primary_pollutant",
              visible: true,
              label: "首要污染物",
            },
            ]
          }, {
            type: "text",
            //text: "数据更新时间：{squeakdb.public.view_latest_pollution.time:DateString(hideTime: false, local: false, systemLocale: false)}",
            text: "数据更新时间：{squeakdb.public.view_latest_pollution.time:DateFormat(datePattern: 'yyyy-MM-d', timePattern: 'HH:mm')}",
          }]
        };

        var monitorFeatureLayer = new FeatureLayer({
          url: "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer/0",
          outFields: ["*"],
          popupTemplate: template
        });
        //app.mapView.map.add(monitorFeatureLayer);

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

        // popup detail content
        app.mapView.popup.on("trigger-action", function (e) {
          if (e.action.id == "detail") {
            showPollutionDeatils();
          }
        });

        // update detail info
        app.mapView.on("click", function (e) {
          console.log("view click")
          var screenPoint = {
            x: e.x,
            y: e.y
          };

          app.mapView.hitTest(screenPoint).then(updateDetailInfo);
        });
      });
    }

    function updateDetailInfo(response) {
      dom.byId("detail-station-name").innerHTML = "监测站名称: " + isNullValue(response.results[0].graphic.getAttribute("hangzhouPollutionStation.name"));
      dom.byId("detail-station-area").innerHTML = "所在城市: " + isNullValue(response.results[0].graphic.getAttribute(["hangzhouPollutionStation.area"]));
      dom.byId("detail-station-time").innerHTML = "数据更新时间： " + isNullValue(formatDate(getLocalTime(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.time"]))));

      dom.byId("detail-detail-quality").innerHTML = "空气质量: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.quality"]));
      dom.byId("detail-detail-aqi").innerHTML = "AQI: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.aqi"]));
      dom.byId("detail-detail-primary-pollutant").innerHTML = "首要污染物: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.primary_pollutant"]));
      dom.byId("detail-detail-pm25").innerHTML = "PM2.5: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.pm25"]));
      dom.byId("detail-detail-pm10").innerHTML = "PM10: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.pm10"]));
      dom.byId("detail-detail-co").innerHTML = "CO: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.co"]));
      dom.byId("detail-detail-no2").innerHTML = "NO2: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.no2"]));
      dom.byId("detail-detail-o3").innerHTML = "O3: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.o3"]));
      dom.byId("detail-detail-so2").innerHTML = "SO2: " + isNullValue(response.results[0].graphic.getAttribute(["squeakdb.public.view_latest_pollution.so2"]));

      function getLocalTime(timestamp) {
        return new Date(parseInt(timestamp));
      }

      function formatDate(date, fmt) {
        return locale.format(date, { datePattern: 'yyyy-MM-d', timePattern: 'HH:mm' });
      };

      function isNullValue(value) {
        if (value == null) {
          return "--"
        }
        return value
      }
    }

    //----------------------------------
    // Pollution Station GraphicsLayer
    //----------------------------------

    function initializeStationLayer() {
      var graphicsLayer = new GraphicsLayer();
      var layer = "https://gis.xzdbd.com/arcgis/rest/services/dev/PollutionStation/MapServer/0";
      var goodSymbol = new PictureMarkerSymbol({
        url: "/static/images/good.png",
        width: "56px",
        height: "70px",
      });
      var fineSymbol = new PictureMarkerSymbol({
        url: "/static/images/fine.png",
        width: "56px",
        height: "70px",
      });
      var slightSymbol = new PictureMarkerSymbol({
        url: "/static/images/slight.png",
        width: "56px",
        height: "70px",
      });
      var mediumSymbol = new PictureMarkerSymbol({
        url: "/static/images/medium.png",
        width: "56px",
        height: "70px",
      });
      var heavySymbol = new PictureMarkerSymbol({
        url: "/static/images/heavy.png",
        width: "56px",
        height: "70px",
      });
      var severeSymbol = new PictureMarkerSymbol({
        url: "/static/images/severe.png",
        width: "56px",
        height: "70px",
      });
      var template = {
        title: "<font color='#008000'>监测站：{hangzhouPollutionStation.name}",

        content: [{
          type: "fields",
          fieldInfos: [{
            fieldName: "squeakdb.public.view_latest_pollution.aqi",
            visible: true,
            label: "AQI",
            format: {
              places: 0,
              digitSeparator: true
            },
          }, {
            fieldName: "squeakdb.public.view_latest_pollution.quality",
            visible: true,
            label: "当前空气质量",
          }, {
            fieldName: "squeakdb.public.view_latest_pollution.primary_pollutant",
            visible: true,
            label: "主要污染物",
          },
          ]
        }, {
          type: "text",
          text: "数据更新时间：{squeakdb.public.view_latest_pollution.time:DateFormat(datePattern: 'yyyy-MM-d', timePattern: 'HH:mm')}",
        }],

        actions: [{
          title: "详情",
          id: "detail",
          className: "esri-icon-dashboard",
        }]
      };
      var queryTask = new QueryTask({
        url: layer
      });
      var query = new Query();
      query.returnGeometry = true;
      query.outFields = ["*"];
      query.where = "1=1";

      queryTask.execute(query, { cacheBust: true }).then(function (result) {
        if (result.features.length > 0) {
          result.features.forEach(function (graphic) {
            quality = graphic.getAttribute("squeakdb.public.view_latest_pollution.quality");
            switch (quality) {
              case "优":
                graphic.symbol = goodSymbol;
                break;
              case "良":
                graphic.symbol = fineSymbol;
                break;
              case "轻度污染":
                graphic.symbol = slightSymbol;
                break;
              case "中度污染":
                graphic.symbol = mediumSymbol;
                break;
              case "重度污染":
                graphic.symbol = heavySymbol;
                break;
              case "严重污染":
                graphic.symbol = severeSymbol;
                break;
              default:
                graphic.symbol = goodSymbol;
                break;
            }
            graphic.popupTemplate = template;
            graphicsLayer.add(graphic);
          });
          app.mapView.map.layers.add(graphicsLayer);
        }
      });
    }

    //----------------------------------
    // Pollution Details Handler
    //----------------------------------

    function showPollutionDeatils() {
      if (domClass.contains(query(".calcite-div-toggle")[0], "calcite-div-toggle-zero-bottom")) {
        zoomOutResultContent()
      }
      /*console.log(app.mapView.popup.viewModel.selectedFeature.attributes["hangzhouPollutionStation.name"]);
      dom.byId("detail-station-name").innerHTML = "监测站名称: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["hangzhouPollutionStation.name"]);
      dom.byId("detail-station-area").innerHTML = "所在城市: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["hangzhouPollutionStation.area"]);
      dom.byId("detail-station-time").innerHTML = "数据更新时间： " + isNullValue(formatDate(getLocalTime(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.time"])));

      dom.byId("detail-detail-quality").innerHTML = "空气质量: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.quality"]);
      dom.byId("detail-detail-aqi").innerHTML = "AQI: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.aqi"]);
      dom.byId("detail-detail-primary-pollutant").innerHTML = "首要污染物: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.primary_pollutant"]);
      dom.byId("detail-detail-pm25").innerHTML = "PM2.5: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.pm25"]);
      dom.byId("detail-detail-pm10").innerHTML = "PM10: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.pm10"]);
      dom.byId("detail-detail-co").innerHTML = "CO: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.co"]);
      dom.byId("detail-detail-no2").innerHTML = "NO2: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.no2"]);
      dom.byId("detail-detail-o3").innerHTML = "O3: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.o3"]);
      dom.byId("detail-detail-so2").innerHTML = "SO2: " + isNullValue(app.mapView.popup.viewModel.selectedFeature.attributes["squeakdb.public.view_latest_pollution.so2"]);


      function getLocalTime(timestamp) {
        return new Date(parseInt(timestamp));
      }

      function formatDate(date, fmt) {
        return locale.format(date, { datePattern: 'yyyy-MM-d', timePattern: 'HH:mm' });
      };

      function isNullValue(value) {
        if (value == null) {
          return "--"
        }
        return value
      }*/

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
      setChartEvents();
    }

    //----------------------------------
    // Basemaps
    //----------------------------------

    function setBasemapEvents() {

      // Sync basemaps for map and scene
      query("#selectBasemapPanel").on("change", function (e) {
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
      query(".calcite-panels .panel").on("show.bs.collapse", function (e) {
        if (app.activeView.popup.currentDockPosition || app.activeView.widthBreakpoint === "xsmall") {
          app.activeView.popup.dockEnabled = false;
        }
      });

      // Panels - Undock popup when panels hide (mobile only)
      query(".calcite-panels .panel").on("hide.bs.collapse", function (e) {
        if (app.activeView.widthBreakpoint === "xsmall") {
          app.activeView.popup.dockEnabled = true;
        }
      });
    }

    //----------------------------------
    // Popup collapse (optional)
    //----------------------------------

    function setPopupEvents() {
      query(".esri-popup__header-title").on("click", function (e) {
        query(".esri-popup__main-container").toggleClass("esri-popup-collapsed");
        app.activeView.popup.reposition();
      }.bind(this));
    }

    //----------------------------------
    // Result Content
    //----------------------------------
    function setResultContentEvents() {
      query(".calcite-div-toggle").on("click", function (e) {
        // open, to close
        if (domClass.contains(e.currentTarget, "calcite-div-toggle-bottom")) {
          zoomInResultContent();
        } else if (domClass.contains(e.currentTarget, "calcite-div-toggle-zero-bottom")) {
          zoomOutResultContent(e);
        }
      });
    }

    function zoomOutResultContent() {
      domClass.replace(query(".calcite-div-toggle")[0], "calcite-div-toggle-bottom", "calcite-div-toggle-zero-bottom");
      domClass.replace(query(".calcite-div-toggle .up-arrow")[0], "down-arrow", "up-arrow");
      domClass.replace(query(".calcite-div-content-info-collapse")[0], "calcite-div-content-info", "calcite-div-content-info-collapse");
      domClass.add(query(".calcite-legend-box")[0], "calcite-legend-box-up");
    }

    function zoomInResultContent() {
      domClass.replace(query(".calcite-div-toggle")[0], "calcite-div-toggle-zero-bottom", "calcite-div-toggle-bottom");
      domClass.replace(query(".calcite-div-toggle .down-arrow")[0], "up-arrow", "down-arrow");
      domClass.replace(query(".calcite-div-content-info")[0], "calcite-div-content-info-collapse", "calcite-div-content-info");
      domClass.remove(query(".calcite-legend-box")[0], "calcite-legend-box-up");
    }

    //----------------------------------
    // Legend events
    //----------------------------------
    function setLegendEvents() {
      app.legend.layerInfos[0].layer.then(function () {
        var legendContentNode = domConstruct.create("div", {
          className: "calcite-legend-content"
        }, query(".calcite-legend-container")[0]);

        app.legend.activeLayerInfos.items[0].legendElements.forEach(function (element) {
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

    //----------------------------------
    // Chart
    //----------------------------------
    function setChartEvents() {
      var chartData
      request.get("./pollution/chart?id=1", {
        handleAs: "json"
      }).then(function (data) {
        /*var features = {
          "features": [{ "attributes": { "name": "111", "aqi": 32 } },
          { "attributes": { "name": "222", "aqi": 42 } }]
        };*/

        console.log(data);
        var features = { "features": [] }
        data.forEach(function (data) {
          features.features.push({ "attributes": { "time_point": formatSimpleDate(getLocalTime(data.time_point)), "aqi": data.aqi, "full_time": formatFullDate(getLocalTime(data.time_point))} })
        })
        var chart = new Cedar({ "type": "time" });
        var dataset = {
          "data": features,
          "mappings": {  
            "time": { "field": "time_point", "label": "Time" },
            "value": { "field": "aqi", "label": "AQI" },
            "sort": "time_point ASC",
          }
        };

        //assign to the chart
        chart.dataset = dataset;

        chart.tooltip = {
          "title": "{full_time}",
          "content": "AQI: {aqi}"
        }

        //show the chart
        chart.show({
          elementId: "#chart",
        });
      });

      function getLocalTime(time) {
        return new Date(time);
      }

      function formatSimpleDate(date) {
        return locale.format(date, { selector: "time", timePattern: 'H' });
      };

      function formatFullDate(date) {
        return locale.format(date, { datePattern: 'yyyy-MM-d', timePattern: 'HH:mm' });
      };

    }


  });