import _ from 'lodash';


export default {
  ALL: `
    SELECT DISTINCT ?p ?st ?et ?lat ?long {
      {
        ?pType rdfs:subClassOf scor:Deliver;
          rdfs:label ?label.
      } UNION {
        ?pType rdfs:subClassOf scor:Source;
          rdfs:label ?label.
      }
      ?p a ?pType;
        ex:hasStartTime ?st;
        ex:hasEndTime ?et;
        ex:hasPath/ngeo:posList ?l.
      ?l rdfs:member ?mem.
      ?mem geo:lat ?lat;
        geo:long ?long.

    }`,
  BASE: _.template(`
    SELECT ?p <%= select %>
    WHERE {
      ?p a scor:<%= processType %> .
      <%= triples %>
      <%= filters %>
    }
    GROUP BY ?p
    `),

  METRIC1: {
    SELECT: '(AVG(xsd:decimal((xsd:decimal(?value1)+xsd:decimal(?value2))/2)) AS ?metricResult)',
    TRIPLES: [
      '?p scor:hasMetricRL_32 ?value1 .',
      '?p scor:hasMetricRL_34 ?value2 .',
    ],
  },
  PROPS: {
    PRODUCT_NAME: {
      TRIPLES: ['?p ex:isSubjectOf ?pn .'],
      FILTERS: _.template('FILTER(regex(str(?pn), "<%= productName %>")) .'),
    },
    START_TIME: {
      TRIPLES: ['?p ex:hasStartTime ?st .'],
      FILTERS: _.template('FILTER(?st = "<%= startTime %>"^^xsd:datetime) .'),

    },
    END_TIME: {
      TRIPLES: ['?p ex:hasEndTime ?et .'],
      FILTERS: _.template('FILTER(?et = "<%= endTime %>"^^xsd:datetime) .'),
    },
  },
};