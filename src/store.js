'use strict';

import rdfstore from 'rdfstore/dist/rdfstore';
import * as config from './config';
import _ from 'lodash';
import Q from 'q';
import * as QUERIES from  './queries.js';

let store = null;
let data  = null;
const self = this;

// make an instance of store. this must be created once and used among everytime.
function createInstance() {
  let deferred = Q.defer();
  
  rdfstore.create((err, s) => {
	s.registerDefaultProfileNamespaces();
	_.forOwn(config.prefixes, (val, key) => {
      s.registerDefaultNamespace(key, val);
	});
	deferred.resolve(s);
  });
  
  return deferred.promise;
}

// check if store is ready to use or not
function loaded() {
  return store !== null;
}

// run a query
function runQuery(query) {
  let deferred = Q.defer();
  Q.spawn(function*() {

	// if an instance of store is not ready, create it
	if (!loaded()) {
	  yield load();
	}

	// execute query
	store.execute(query, (err, res) => {
	  if (err) {
		console.debug(err); // TODO think of a streamlined way of raising and reporting errors
		return;
	  }
	  
	  deferred.resolve(res);
	});
  });

  return deferred.promise;
}

// set data
function setData(d) {
  data = d;
}


// create a store instance and load the datao
function load() {
  
  if (!data)
	throw new Error('data should have been assigned with setData(data)!');
  
  let deferred = Q.defer();
  
  Q.fcall(createInstance).then(s => {
	store = s;
	
	store.load('text/turtle', data, (s, n) => {
	  console.log(`Loaded ${n} triples`);
	  deferred.resolve(n);
	});
  });

  return deferred.promise;
}

function query_all() {
  return  Q.fcall(runQuery.bind(null, QUERIES.PROCESSES.ALL));
}

function query_q1(productName) {

  let query = QUERIES.PROCESSES.QUERY1;
  // TODO put params into query
  query = query.replace(/:productName/, productName);
  return  Q.fcall(runQuery.bind(null, query));
}

export {
  load,
  query_all,
  query_q1,
  setData
}
