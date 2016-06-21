import 'babel-polyfill';
import leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import rdfstore from 'rdfstore/dist/rdfstore';
import './index.css';


leaflet.Icon.Default.imagePath = '/leaflet/dist/images';
var mapEl = leaflet.map('mapid').setView([50.73211, 7.09305], 11);
leaflet.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(mapEl);

var reader;
reader = new FileReader();

function readText(filePath) {
    var output = "";
    if(filePath.files && filePath.files[0]) {
        reader.onload = function (e) {
            output = e.target.result;
            loadData(output);
        };
        reader.readAsText(filePath.files[0]);
    }
    return true;
}

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(mapEl);
}

function doAnalyze() {
  popup.setLatLng([51.508, -0.11]).setContent("You have started the analysis!").openOn(mapEl);
}

function loadData(data) {
  var query = 'SELECT ?sx ?sy ?dx ?dy {\
                 ?p a <http://purl.org/eis/vocab/scor#DeliverStockedProduct>;\
                    <http://example.org/hasSourceX> ?sx;\
                    <http://example.org/hasSourceY> ?sy;\
                    <http://example.org/hasDestX> ?dx;\
                    <http://example.org/hasDestY> ?dy.\
               }';

  //query = 'SELECT * { ?s ?p ?o }';
  rdfstore.create(function (err, store) {
    store.load('text/turtle', data, function (succ, n) {
      console.log(`Loaded ${n} triples`);
      store.execute(query, function (err, res) {
        if (err) console.log(err);
        else {
          var process = res[0];
          leaflet.marker([process.sx.value, process.sy.value]).addTo(mapEl)
            .bindPopup('Source');
          leaflet.marker([process.dx.value, process.dy.value]).addTo(mapEl)
            .bindPopup('Dest');
        }
      });
    });
  });
}


/*leaflet.marker([51.5, -0.09]).addTo(mapEl)*/
  //.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();

//leaflet.circle([51.508, -0.11], 500, {
  //color: 'red',
  //fillColor: '#f03',
  //fillOpacity: 0.5
//}).addTo(mapEl).bindPopup("I am a circle.");

//leaflet.polygon([
  //[51.509, -0.08],
  //[51.503, -0.06],
  //[51.51, -0.047]
//]).addTo(mapEl).bindPopup("I am a polygon.");

var popup = leaflet.popup();

mapEl.on('click', onMapClick);

module.exports = {
  readText,
};
