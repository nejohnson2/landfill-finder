var post_url = 'http://localhost:5000';
var get_url = 'http://localhost:5000/api/v1/landfills';

// https://openlayers.org/en/latest/doc/quickstart.html
var raster = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: "As1jW63G51I3Z3jFZmmsNHsJ8CVxNtkyd7VCtzXk-E0Bztzd80fR0axNXApJW3O5",
    imagerySet: 'AerialWithLabels',
  })
});

//////////////////////
// Create Map 
//////////////////////
var map = new ol.Map({
  layers: [raster],
  target: 'map',
  view: new ol.View({
    center: [-74.006, 40.7128],
    projection: 'EPSG:4326',
    zoom: 10
  })
});

var extent = new ol.interaction.Extent({
  condition: ol.events.condition.platformModifierKeyOnly
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

/////////////////////////
// Submit Entry to server
/////////////////////////
this.addEventListener('keyup', function(event) {
  if (event.keyCode == 83) {
    var landfill = {'extent' : extent.getExtent()};

    $.ajax({
      type: "POST",
      url: post_url,
      success: getNewLandfill,
      data: JSON.stringify(landfill),
    });
  }
});

/////////////////////////////
// Center Map on new landfill
/////////////////////////////
function drawMap(data){
  map.getView().setCenter([data['lat'], data['lon']]);
  map.getView().setZoom(13);
}

////////////////////////////
// Get new landfill location
////////////////////////////
function getNewLandfill(){
  $.ajax({
    type: "GET",
    url: get_url,
    success: drawMap,
    dataType: 'json'
  });
}


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