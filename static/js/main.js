/*
Built from examples:
- https://openlayersbook.github.io/ch05-using-vector-layers/example-01.html
- https://openlayers.org/en/latest/examples/draw-features.html?q=multiple
- https://openlayers.org/en/latest/doc/quickstart.html
*/
var extents = new Array();
var post_url = 'http://localhost:5000';
var get_url = 'http://localhost:5000/api/v1/landfills';

var raster = new ol.layer.Tile({
  preload: Infinity,
  source: new ol.source.BingMaps({
    key: "As1jW63G51I3Z3jFZmmsNHsJ8CVxNtkyd7VCtzXk-E0Bztzd80fR0axNXApJW3O5",
    imagerySet: 'AerialWithLabels',
  })
});

var extent = new ol.interaction.Extent({
  condition: ol.events.condition.platformModifierKeyOnly
});

var view = new ol.View({
  center: [0,0],
  projection: 'EPSG:4326',
  zoom: 14
})

//////////////////////
// Create Map 
//////////////////////
var map = new ol.Map({
  renderer: 'webgl',
  layers: [raster],
  target: 'map',
  view: view,
});

map.addInteraction(extent);
extent.setActive(false);

//////////////////////
// Enable interaction 
//////////////////////
this.addEventListener('keydown', function(event) {
  if (event.keyCode == 16) {
    extent.setActive(true);
  }
});
this.addEventListener('keyup', function(event) {
  if (event.keyCode == 16) {
    extent.setActive(false);
  }
});
this.addEventListener('keyup', function(event) {
  // The letter 'a'
  if (event.keyCode == 65) {
    extents.push(extent.getExtent());
  }
});

/////////////////////////
// Submit Entry to server
/////////////////////////
this.addEventListener('keyup', function(event) {
  if (event.keyCode == 83) {
    var landfill = {'extent' : extents};

    $.ajax({
      type: "POST",
      url: post_url,
      success: getNewLandfill,
      data: JSON.stringify(landfill),
    });
  }
}); 

/////////////////////////
// Success on Get
/////////////////////////
function successHandler(data){
  map.getView().setCenter([data['lat'], data['lon']]);

  /////////
  var style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: [0,255,255],
    }),
    stroke: new ol.style.Stroke({
      color: [64, 200, 200, 0.5],
      width: 1      
    })
  });

  var feature = new ol.Feature({
    geometry: new ol.geom.Point([data['lat'], data['lon']]),
  });

  var vectorSource = new ol.source.Vector({ 
    projection: 'EPSG:4326',
    features: [feature],
    style: style,
  });

  var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  });
  /////////////  
  console.log('added layer');
  map.addLayer(vectorLayer);
}

////////////////////////////
// Get new landfill location
////////////////////////////
function getNewLandfill(){
  $.ajax({
    type: "GET",
    url: get_url,
    success: successHandler,
    dataType: 'json'
  });
}

getNewLandfill();



//////////////////////
// 
//////////////////////
// var modify = new ol.interaction.Modify({source: source});
// map.addInteraction(modify);

// var draw, snap; // global so we can remove them later
// function addInteractions() {
//   draw = new ol.interaction.Draw({
//     source: source,
//     type: 'Circle',
//     geometryFunction: ol.interaction.Draw.createBox()
//   });
//   map.addInteraction(draw);
//   snap = new ol.interaction.Snap({source: source});
//   map.addInteraction(snap);

// }

// addInteractions();