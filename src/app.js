/* global $ */

import 'babel-polyfill';
import _ from 'lodash';
// import $ from 'jquery';
// import jQuery from 'jquery';
import moment from 'moment';


import map from './map';
import 'semantic-ui/dist/semantic.js';
import 'semantic-ui/dist/semantic.css';

import * as db from './store';
import './index.css';


// open file from uploader input and load data into rdfstore
function openFile() {
  const reader = new FileReader();

  let content = '';
  const filePath = this;

  if (filePath.files && filePath.files[0]) {
    reader.onload = (ev) => {
      content = ev.target.result;
      db.setData(content);

      db.queryAll().then(t => {
        displayAllProcesses(t);
        console.log(t);
      });
    };

    reader.readAsText(filePath.files[0]);
  }
  return true;
}

function displayAllProcesses(res) {
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

// function submitQuery(e) {

//   if (e.preventDefault) e.preventDefault();

//   const store = e.data.store;
//   const q = $('#queryForm :input[name=query]')[0].value;

//   store.execute(q, (err, res) => {
//     console.log(err || res);
//   });

//   return false;
// }
function formatDate(dateStr) {
	if(!dateStr)
		return undefined;
	try {
		return new Date(dateStr).getTime();
	} catch(err) {
		console.log(err);
		return undefined;
	}
}

function submitAnalyse(e) {
  if (e.preventDefault) e.preventDefault();

	// they were like this in the past
	// const processType = $('#analyzeForm input[name=processTypeInput]')[0].value;
	// they were changed to this, since the selector could not find the input.
	// tested on Chrome 
	const productName = $('input[name=productNameInput]').val();
	const startTime = formatDate($('input[name=startTimeInput]').val());
	const endTime = formatDate($('input[name=endTimeInput]').val());
	const metricName = $('input[name=metricInput]').val();
	const processType = $('input[name=processTypeInput]').val();

  db.buildQuery(processType, metricName, { productName, startTime, endTime }).then(res => {
    console.log(res);
      res.forEach((v) => {

      map.addLabelToProcess(v.p.value, `${v.metricResult.value}`);
    });
  });
}


$('#upload-button').click(() => $('#dataFile').click());

// $('#queryForm').submit(submitQuery);

$('#dataFile').change(openFile);

$('#analyzeForm').submit(submitAnalyse);

$(document).ready(() => {
  $('.ui.dropdown').dropdown();
});

module.exports = {
  openFile
  // submitQuery,
};
