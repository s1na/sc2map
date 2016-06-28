import leaflet from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './index.css';


class Map {
  constructor(container = 'mapid', initialView = [50.73211, 7.09305], initialZoom = 11) {
    leaflet.Icon.Default.imagePath = '/leaflet/dist/images';

    this.el = leaflet.map(container).setView(initialView, initialZoom);

    const accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw';
    leaflet.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`, {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets',
    }).addTo(this.el);

    this.popup = leaflet.popup();
    this.el.on('click', this.onMapClick.bind(this));
  }

  onMapClick(e) {
    this.popup
      .setLatLng(e.latlng)
      .setContent(`You clicked the map at ${e.latlng.toString()}`)
      .openOn(this.el);
  }

  addPath(path, info) {
    const latlngs = [];
    path.forEach((val, i) => {
      const marker = leaflet.marker(val).addTo(this.el);
      marker.bindPopup(`Node ${i}`);
      latlngs.push(marker.getLatLng());
    });
    leaflet.polyline(latlngs).addTo(this.el)
      .bindPopup(info);
  }
}


const map = new Map();

export default map;
