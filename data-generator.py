import random
import sys
import string
import time

from rdflib import Graph, URIRef, BNode, Literal, Namespace
from rdflib.namespace import RDF, RDFS, XSD



# Namespaces
scorvoc = Namespace('http://purl.org/eis/vocab/scor#')
geo = Namespace('http://www.w3.org/2003/01/geo/wgs84_pos#')
ngeo = Namespace('http://geovocab.org/geometry#')
ex = Namespace('http://example.org/')

# Constants
YEAR = 1 * 12 * 30 * 24 * 60 * 60

# Global variables
nodeTypes = ['factory', 'mine', 'powerPlant', 'farm', 'silo', 'windMill']
processTypes = [
    {
        'uri': scorvoc['DeliverStockedProduct'],
        'metrics': [
            scorvoc['hasMetricRS_20'], scorvoc['hasMetricAG_1'], scorvoc['hasMetricAG_4'],
            scorvoc['hasMetricAG_32'], scorvoc['hasMetricCO_18'], scorvoc['hasMetricCO_19'],
            scorvoc['hasMetricCO_20'], scorvoc['hasMetricCO_21'], scorvoc['hasMetricCO_22'],
            scorvoc['hasMetricCO_23'], scorvoc['hasMetricCO_24'], scorvoc['hasMetricCO_25'],
            scorvoc['hasMetricCO_26'], scorvoc['hasMetricCO_27'], scorvoc['hasMetricAM_17'],
            scorvoc['hasMetricAM_45'],
        ],
    },
    {
        'uri': scorvoc['SourceMakeToOrderProduct'],
        'metrics': [
            scorvoc['hasMetricAG_9'], scorvoc['hasMetricAG_40'], scorvoc['hasMetricAG_42'],
            scorvoc['hasMetricAG_46'], scorvoc['hasMetricCO_5'], scorvoc['hasMetricCO_6'],
            scorvoc['hasMetricCO_7'], scorvoc['hasMetricCO_8'], scorvoc['hasMetricCO_9'],
            scorvoc['hasMetricCO_10'], scorvoc['hasMetricCO_11'], scorvoc['hasMetricCO_12'],
            scorvoc['hasMetricAM_16'],
        ],
    },
    {
        'uri': scorvoc['MakeToOrder'],
        'metrics': [
            scorvoc['hasMetricCO_14'], scorvoc['hasMetricCO_15'], scorvoc['hasMetricCO_16'],
            scorvoc['hasMetricCO_17'], scorvoc['hasMetricRL_58'], scorvoc['hasMetricRS_21'],
            scorvoc['hasMetricAG_2'], scorvoc['hasMetricAG_38'], scorvoc['hasMetricAM_17'],
            scorvoc['hasMetricAM_22'],
        ],
    },
]
metrics = [
    scorvoc['hasMetricCO_14'], scorvoc['hasMetricCO_15'], scorvoc['hasMetricCO_16'], scorvoc['hasMetricCO_17'],
    scorvoc['hasMetricRL_32'], scorvoc['hasMetricRL_33'], scorvoc['hasMetricRL_34'], scorvoc['hasMetricRL_50'],
    scorvoc['hasMetricRL_12'], scorvoc['hasMetricRL_24'], scorvoc['hasMetricRL_41'], scorvoc['hasMetricRL_42'],
    scorvoc['hasMetricAG_1'], scorvoc['hasMetricAG_2'], scorvoc['hasMetricAG_3'], scorvoc['hasMetricAG_4'],
    scorvoc['hasMetricRL_55'], scorvoc['hasMetricAG_5'],
]
point_counter = 0

def persist_graph(g):
    with open('dataset.ttl', 'wb') as f:
        f.write(g.serialize(format='turtle'))

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def datetime_generator(before=time.time() - YEAR):
    now = time.time()
    t = random.randint(0, int(before))
    return t, time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(t))

def generate_process(g, pid):
    path = generate_path(g, pid)
    process = ex['process%d' % pid]
    processIn = random.randint(0, len(processTypes) - 1)
    g.add((process, RDF.type, processTypes[processIn]['uri']))
    g.add((process, ex.hasSupplier, Literal(id_generator())))
    g.add((process, ex.isSubjectOf, Literal(id_generator())))
    g.add((process, ex.hasPath, path))
    end_time = datetime_generator()
    g.add((process, ex.hasEndTime, Literal(end_time[1], datatype=XSD.datetime)))
    g.add((process, ex.hasStartTime, Literal(datetime_generator(before=end_time[0])[1], datatype=XSD.datetime)))
    for m in processTypes[processIn]['metrics']:
        g.add((process, m, Literal(random.randint(0, 100), datatype=XSD.integer)))

def generate_path(g, pid):
    global point_counter

    points = []
    for i in range(2, 5):
        point = ex['point%d' % point_counter]
        point_counter += 1
        g.add((point, RDF.type, geo.Point))
        g.add((point, geo.lat, Literal(str(random.uniform(-90, 90)), datatype=XSD.double)))
        g.add((point, geo.long, Literal(str(random.uniform(-180, 180)), datatype=XSD.double)))
        g.add((point, ex.hasName, Literal(id_generator())))
        g.add((point, ex.hasType, Literal(nodeTypes[random.randint(0, len(nodeTypes) - 1)])))
        points.append(point)

    pathSeq = ex['p%dPathSeq' % pid]
    path = ex['p%dPath' % pid]
    g.add((pathSeq, RDF.type, RDF.Seq))
    for p in points:
        g.add((pathSeq, RDFS.member, p))

    g.add((path, RDF.type, ngeo.LineString))
    g.add((path, ngeo.posList, pathSeq))

    return path



if __name__ == '__main__':
    # Graph
    g = Graph()


    proc_count = 5
    if len(sys.argv) > 1:
        proc_count = int(sys.argv[1])

    for i in range(proc_count):
        generate_process(g, i)

    persist_graph(g)
