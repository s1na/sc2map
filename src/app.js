import 'babel-polyfill';
import rdfstore from 'rdfstore/dist/rdfstore';
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
// import 'material-design-lite';
import map from './map';
import * as config from './config';
import * as sem from  'semantic-ui/dist/semantic.css';
// import 'material-design-lite/material.css';
import './index.css';


const reader = new FileReader();

function loadData(store, data) {
  const query = `
    SELECT ?p ?st ?et ?mem ?lat ?long {
      ?p a scor:DeliverStockedProduct;
         ex:hasStartTime ?st;
         ex:hasEndTime ?et;
         ex:hasPath/ngeo:posList ?l.
      ?l rdfs:member ?mem.
      ?mem geo:lat ?lat;
           geo:long ?long.
    }`;

  store.load('text/turtle', data, (succ, n) => {
    console.log(`Loaded ${n} triples`);
    store.execute(query, (err, res) => {
      if (err) console.log(err);
      else {
        console.log(res);
        if (res.length > 0) {
          const processes = {};
          for (let i = 0; i < res.length; i++) {
            if (res[i].p.value in processes) {
              processes[res[i].p.value].points.push([res[i].lat.value, res[i].long.value]);
            } else {
              const st = moment(res[i].st.value);
              const et = moment(res[i].et.value);
              const duration = et.from(st);
              processes[res[i].p.value] = {
                st,
                et,
                duration,
                points: [[res[i].lat.value, res[i].long.value]],
              };
            }
          }
          _.forOwn(processes, (v, k) => {
            map.addProcess(k, v);
          });
        }
      }
    });
  });
}

function readText(e) {
  let output = '';
  const filePath = this;
  const store = e.data.store;
  if (filePath.files && filePath.files[0]) {
    reader.onload = (ev) => {
      output = ev.target.result;
      loadData(store, output);
    };
    reader.readAsText(filePath.files[0]);
  }
  return true;
}

function submitQuery(e) {
  if (e.preventDefault) e.preventDefault();
  const store = e.data.store;
  const q = $('#queryForm :input[name=query]')[0].value;
  store.execute(q, (err, res) => {
    if (err) console.log(err);
    else {
      console.log(res);
    }
  });
  return false;
}

function submitAnalyse(e) {
  if (e.preventDefault) e.preventDefault();
  const store = e.data.store;
  const productName = $('#analyseForm :input[name=productNameInput]')[0].value;
//  const startTime = $('#analyseForm :input[name=startTimeInput]')[0].value;
//  const endTime = $('#analyseForm :input[name=endTimeInput]')[0].value;

  const query = `
    SELECT ?p (AVG(xsd:decimal((xsd:decimal(?value1)+xsd:decimal(?value2))/2)) AS ?metricResult)
    WHERE {
      ?p a scor:DeliverStockedProduct;
         ex:isSubjectOf ?pn;
         scor:hasMetricRL_32 ?value1;
         scor:hasMetricRL_34 ?value2.
      FILTER(regex(str(?pn), "${productName}")).
    }
    GROUP BY ?p
    `;
  store.execute(query, (err, res) => {
    if (err) console.log(err);
    else {
      console.log(res);
      res.forEach((v) => {
        map.addLabelToProcess(v.p.value, `<li>${v.metricResult.value}</li>`);
      });
    }
  });
}

rdfstore.create((err, store) => {
  store.registerDefaultProfileNamespaces();
  _.forOwn(config.prefixes, (val, key) => {
    store.registerDefaultNamespace(key, val);
  });

  $('#queryForm').submit({ store }, submitQuery);

  $('#dataFile').change({ store }, readText);

  $('#analyseForm').submit({ store }, submitAnalyse);
});


module.exports = {
  readText,
  submitQuery,
};
