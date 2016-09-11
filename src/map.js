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

    this.colors = [
      '#7f8c8d', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#e74c3c', '#ecf0f1', '#2c3e50', '#f1c40f', '#1abc9c',
    ];
    this.usedColors = [];
    this.processes = {};


    // Specifying new icon to present the anchors
    this.greenIcon = leaflet.icon({
      iconUrl: 'leaf-green.png',
      iconSize: [38, 95], // size of the icon
      shadowSize: [50, 64], // size of the shadow
      iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
    });
  }

  onMapClick(e) {
    this.popup
      .setLatLng(e.latlng)
      .setContent(`You clicked the map at geo: ${e.latlng.toString()}`)
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
        <li>Start Time:  ${p.et.format('ddd, MMM Do YYYY, HH:mm:ss')}</li>
        <li>End Time:  ${p.st.format('ddd, MMM Do YYYY, HH:mm:ss')}</li>
        <li>Duration: ${p.duration}</li>
      </ul>
      `;

    p.points.forEach((val, i) => {
      const marker = leaflet.marker(val).addTo(this.el);
      marker.bindPopup(`Node number: ${i}`);
      latlngs.push(marker.getLatLng());
      p.markers.push(marker);
    });
    p.line = leaflet.polyline(latlngs, { color }).addTo(this.el)
      .bindTooltip(p.info, { permanent: false });
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
    this.processes[uid].line.bindTooltip(this.processes[uid].info, { permanent: false });
  }
}


const map = new Map();

export default map;
