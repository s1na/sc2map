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
    PRODUCTION_COST: {
      SELECT: '(SUM(xsd:decimal(?value1)+xsd:decimal(?value2)+xsd:decimal(?value3)+xsd:decimal(?value4)) AS ?metricResult)',
      TRIPLES: [
        '?p scor:hasMetricCO_14 ?value1 .',
        '?p scor:hasMetricCO_15 ?value2 .',
        '?p scor:hasMetricCO_16 ?value3 .',
        '?p scor:hasMetricCO_17 ?value4 .',
      ],
    },
    UPSIDE_SUPPLY_CHAIN_FLEXIBILITY: {
      SELECT: '(SUM(xsd:decimal(?value1)+xsd:decimal(?value2)+xsd:decimal(?value3)+xsd:decimal(?value4)+xsd:decimal(?value5)) AS ?metricResult)',
      TRIPLES: [
        '?p scor:hasMetricAG_1 ?value1 .',
        '?p scor:hasMetricAG_2 ?value2 .',
        '?p scor:hasMetricAG_3 ?value3 .',
        '?p scor:hasMetricAG_4 ?value4 .',
        '?p scor:hasMetricAG_5 ?value5 .',
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
