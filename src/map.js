import leaflet from 'leaflet';
// import 'leaflet.label/dist/leaflet.label.js';

import 'leaflet/dist/leaflet.css';
import 'leaflet.label/dist/leaflet.label.css';
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

    this.colors = [
      '#7f8c8d', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#e74c3c', '#ecf0f1', '#2c3e50', '#f1c40f', '#1abc9c',
    ];
    this.usedColors = [];
    this.processes = {};
  }

  onMapClick(e) {
    this.popup
      .setLatLng(e.latlng)
      .setContent(`You clicked the map at ${e.latlng.toString()}`)
      .openOn(this.el);
  }

  addProcess(uid, obj) {
    const p = obj;
    const latlngs = [];

    const color = this.colors.pop();
    this.usedColors.push(color);
    p.color = color;

    p.markers = [];
    p.info = `
      <ul>
        <li>Start time:  ${p.et.format('ddd, MMM Do YYYY, HH:mm:ss')}</li>
        <li>End time:  ${p.st.format('ddd, MMM Do YYYY, HH:mm:ss')}</li>
        <li>Duration: ${p.duration}</li>
      </ul>
      `;

    p.points.forEach((val, i) => {
      const marker = leaflet.marker(val).addTo(this.el);
      marker.bindPopup(`Node ${i}`);
      latlngs.push(marker.getLatLng());
      p.markers.push(marker);
    });
    p.line = leaflet.polyline(latlngs, { color }).addTo(this.el)
      .bindPopup(p.info);

    this.processes[uid] = p;
  }

  addLabelToProcess(uid, label) {
    const lines = this.processes[uid].info.split('\n');
    lines.pop();
    lines.pop();
    this.processes[uid].info = `
      ${lines.join('\n')}
        ${label}
      </ul>
      `;
    this.processes[uid].line.bindPopup(this.processes[uid].info);
  }
}


const map = new Map();

export default map;
