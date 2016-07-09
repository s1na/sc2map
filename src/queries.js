'use strict';

const PROCESSES = {
  ALL: `
    SELECT ?p ?st ?et ?mem ?lat ?long {
      ?p a scor:DeliverStockedProduct;
         ex:hasStartTime ?st;
         ex:hasEndTime ?et;
         ex:hasPath/ngeo:posList ?l.
      ?l rdfs:member ?mem.
      ?mem geo:lat ?lat;
           geo:long ?long.
    }`,
  QUERY1: `
    SELECT ?p (AVG(xsd:decimal((xsd:decimal(?value1)+xsd:decimal(?value2))/2)) AS ?metricResult)
    WHERE {
      ?p a scor:DeliverStockedProduct;
         ex:isSubjectOf ?pn;
         scor:hasMetricRL_32 ?value1;
         scor:hasMetricRL_34 ?value2.
      FILTER(regex(str(?pn), ":productName")).
    }
    GROUP BY ?p
    `
};


export {
  PROCESSES
}
