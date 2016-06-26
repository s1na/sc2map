import 'babel-polyfill';
import rdfstore from 'rdfstore/dist/rdfstore';
import _ from 'lodash';
import $ from 'jquery';
import 'material-design-lite'
import map from './map';
import * as config from './config';

import 'material-design-lite/material.css';
import './index.css';



const reader = new FileReader();
let store;

function loadData(store, data) {
  var query = `
    SELECT ?st ?et ?path {
      ?p a scor:DeliverStockedProduct;
         ex:hasStartTime ?st;
         ex:hasEndTime ?et;
         ex:hasTest/rdf:rest{1}/rdf:first ?path.
    }`;
  store.load('text/turtle', data, (succ, n) => {
    console.log(`Loaded ${n} triples`);
    store.execute(query, (err, res) => {
      if (err) console.log(err);
      else {
        console.log(res);
        //store.node(res[0].path.value, function (err, node) {
          //console.log(node);
        //});
        /* const process = res[0];*/
        //leaflet.marker([process.sx.value, process.sy.value]).addTo(mapEl)
          //.bindPopup('Source');
        //leaflet.marker([process.dx.value, process.dy.value]).addTo(mapEl)
          /*.bindPopup('Dest');*/
      }
    });
  });
}

function readText(e) {
  let output = '';
  let filePath = this;
  let store = e.data.store;
  if (filePath.files && filePath.files[0]) {
    reader.onload = (e) => {
      output = e.target.result;
      loadData(store, output);
    };
    reader.readAsText(filePath.files[0]);
  }
  return true;
}

function submitQuery(e) {
  if (e.preventDefault) e.preventDefault();
  let store = e.data.store;
  let q = $('#queryForm :input[name=query]')[0].value;
  store.execute(q, (err, res) => {
    if (err) console.log(err);
    else {
      console.log(res);
    }
  });
  return false;
}

rdfstore.create((err, store) => {
  store.registerDefaultProfileNamespaces();
  _.forOwn(config.prefixes, (val, key) => {
    store.registerDefaultNamespace(key, val);
  });

  $('#queryForm').submit({ store }, submitQuery)

  $('#dataFile').change({ store }, readText);
});


module.exports = {
  readText,
  submitQuery,
};
