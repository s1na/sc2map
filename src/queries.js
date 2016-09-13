import _ from 'lodash';


export default {
  ALL: `
    SELECT DISTINCT ?p ?st ?et ?lat ?long ?name {
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
        geo:long ?long;
        ex:hasId ?name.

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

  METRICS: {
    DELIVERY_PERFORMANCE: {
      SELECT: '(AVG(xsd:decimal((xsd:decimal(?value1)+xsd:decimal(?value2))/2)) AS ?metricResult)',
      TRIPLES: [
        '?p scor:hasMetricRL_32 ?value1 .',
        '?p scor:hasMetricRL_34 ?value2 .',
      ],
    },
    DELIVERY_IN_FULL: {
      SELECT: '(AVG(xsd:decimal((xsd:decimal(?value1)+xsd:decimal(?value2))/2)) AS ?metricResult)',
      TRIPLES: [
        '?p scor:hasMetricRL_33 ?value1 .',
        '?p scor:hasMetricRL_50 ?value2 .',
      ],
    },
    PERFECT_CONDITION: {
      SELECT: '(AVG(xsd:double((xsd:decimal(?value1)+xsd:decimal(?value2)+xsd:decimal(?value3)+xsd:decimal(?value4)+xsd:decimal(?value5))/5)) AS ?metricResult)',
      TRIPLES: [
        '?p scor:hasMetricRL_12 ?value1 .',
        '?p scor:hasMetricRL_24 ?value2 .',
        '?p scor:hasMetricRL_41 ?value3 .',
        '?p scor:hasMetricRL_42 ?value4 .',
        '?p scor:hasMetricRL_55 ?value5 .',
      ],
    },
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
