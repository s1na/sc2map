import rdfstore from 'rdfstore/dist/rdfstore';
import _ from 'lodash';
import Q from 'q';
import $ from 'jquery';

import * as config from './config';
import queries from './queries.js';


let store = null;
let data = null;
// const self = this;

// make an instance of store. this must be created once and used among everytime.
function createInstance() {
  const deferred = Q.defer();

  rdfstore.create((err, s) => {
    s.registerDefaultProfileNamespaces();
    let registered = 0;
    _.forOwn(config.prefixes, (val, key) => {
      s.registerDefaultNamespace(key, val);
      registered += 1;
      if (_.keys(config.prefixes).length === registered) deferred.resolve(s);
    });
  });

  return deferred.promise;
}

// check if store is ready to use or not
function loaded() {
  return store !== null;
}

// run a query
function runQuery(query) {
  const deferred = Q.defer();
  Q.spawn(function* () {
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
export function setData(d) {
  data = d;
}


// create a store instance and load the datao
export function load() {
  if (!data) {
    throw new Error('data should have been assigned with setData(data)!');
  }

  const deferred = Q.defer();

  Q.fcall(createInstance).then(s => {
    store = s;

    store.load('text/turtle', data, (err, n) => {
      console.log(`Loaded ${n} triples`);
      $.ajax({
        type: 'get',
        url: 'https://raw.githubusercontent.com/vocol/scor/master/scor.ttl',
        data: {},
        xhrfields: {
          withcredentials: false,
        },
        crossdomain: true,
        success: (res) => {
          store.load('text/turtle', res, (err, m) => {
            if (err) console.log(err);
            console.log(`loaded ${m} triples`);
            deferred.resolve(n);
          });
        },
      });
    });
  });

  return deferred.promise;
}

export function queryAll() {
  return Q.fcall(runQuery.bind(null, queries.ALL));
}

export function buildQuery(processType, metric, props) {
  console.log(queries);
  const select = [queries.METRICS[metric].SELECT];
  const triplesList = queries.METRICS[metric].TRIPLES.slice();
  const filtersList = [];
  console.log(select, triplesList, filtersList);

  if (props.productName) {
    triplesList.push(queries.PROPS.PRODUCT_NAME.TRIPLES);
    filtersList.push(queries.PROPS.PRODUCT_NAME.FILTERS({ productName: props.productName }));
  }
  if (props.startTime) {
    triplesList.push(queries.PROPS.START_TIME.TRIPLES);
    filtersList.push(queries.PROPS.START_TIME.FILTERS({ startTime: props.startTime }));
  }
  if (props.endTime) {
    triplesList.push(queries.PROPS.END_TIME.TRIPLES);
    filtersList.push(queries.PROPS.END_TIME.FILTERS({ endTime: props.endTime }));
  }

  const query = queries.BASE({
    processType,
    select: select.join('\n'),
    triples: triplesList.join('\n'),
    filters: filtersList.join('\n'),
  });

  console.log(query);
  return Q.fcall(runQuery.bind(null, query));
}
