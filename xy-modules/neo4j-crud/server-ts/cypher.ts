import neo4j from 'neo4j-driver';
import { neo4jDriver } from '@app-xiao-yong/database-neo4j-server-ts';

function toLabelsString(labels: string[] = []): string {
  let labelString = '';
  labels.forEach((label: string, index) => {
    if (index > 0) {
      labelString += ' ';
    }
    if (/^[a-zA-Z0-9_]+$/.test(label)) {
      labelString += ':' + label;
    } else {
      throw new Error('Cypher query cancelled because label name: "' + label + '" is not safe');
    }
  });
  return labelString;
}

function toRelationshipTypeString(type: string = ''): string {
  if (/^[a-zA-Z0-9_]+$/.test(type)) {
    return ':' + type;
  } else {
    throw new Error('Cypher query cancelled because label name: "' + type + '" is not safe');
  }
}

interface NodeFieldShape {
  identity: number;
  labels: string[];
  properties: any;
}

interface RelationshipFieldShape {
  identity: number;
  start: number;
  end: number;
  type: string;
  properties: any;
}

type FieldShape = NodeFieldShape | RelationshipFieldShape | string | MovieShape;

interface RecordShape {
  /* _fields is a private field, currently no safe way for TypeScript to match this
   * _fields?: Array<FieldShape>,
   */
  keys: string[];
  get(key: string): FieldShape;
}

interface ResultShape {
  records: RecordShape[];
}

interface MovieShape {
  title: string;
  released: number;
  tagline: string;
}

interface NodeShape {
  identity: number;
  labels: string[];
  properties: any;
}

interface RelationshipShape {
  identity: number;
  start: number;
  end: number;
  type: string;
  properties: any;
}

export default class Neo4jQueries {
  public moviesQuery(searchKeyword: string) {
    const session = neo4jDriver.session();
    return session
      .run('MATCH (movie:Movie) \
        WHERE movie.title =~ {title} \
        RETURN movie', {
        title: '(?i).*' + searchKeyword + '.*'
      })
      .then((result: ResultShape) => {
        session.close();
        return result.records.map((record: RecordShape): MovieShape => this.movieModal(record)) || [];
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public getAllNodes() {
    const session = neo4jDriver.session();
    return session
      .run('MATCH (n) RETURN n')
      .then((result: ResultShape) => {
        session.close();
        return result.records.map(
          (record: RecordShape): NodeShape => this.nodeModal(record.get('n') as NodeFieldShape)
        );
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public getAllNodesAndRelationships() {
    const session = neo4jDriver.session();
    return Promise.all([session.run('MATCH (n) RETURN n'), session.run('MATCH ()-[r]-() RETURN r')])
      .then((result: ResultShape[]) => {
        session.close();
        const nodes: NodeShape[] = [];
        const relationships: RelationshipShape[] = [];
        result[0].records.forEach((record: RecordShape) => {
          nodes.push(this.nodeModal(record.get('n') as NodeFieldShape));
        });
        result[1].records.forEach((record: RecordShape) => {
          relationships.push(this.relationshipModal(record.get('r') as RelationshipFieldShape));
        });
        return { nodes, relationships };
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  /* Neo4j CRUD - Node */
  public readNode(identity: number) {
    const session = neo4jDriver.session();
    return session
      .run('MATCH (n) WHERE ID(n) = {identity} RETURN n', { identity: neo4j.int(identity) })
      .then((result: ResultShape) => {
        session.close();
        return result.records.length > 0 ? { ...{}, ...(result.records[0].get('n') as NodeFieldShape) } : null;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public createNode(labels: string[] = [], properties: any = {}) {
    const session = neo4jDriver.session();
    return session
      .run('CREATE (n' + toLabelsString(labels) + ') \
        SET n = $properties \
        RETURN n', { properties })
      .then((result: ResultShape) => {
        session.close();
        return result.records.length > 0 ? { ...{}, ...(result.records[0].get('n') as NodeFieldShape) } : null;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public updateNode(identity: number, labels: string[] = [], properties: any = {}) {
    const session = neo4jDriver.session();
    return session
      .run(
        'MATCH (n) \
        WHERE ID(n) = $identity \
        CALL apoc.create.setLabels(n, $labels) YIELD node \
        WITH node as n \
        CALL apoc.create.setProperties(n, $keys, $values) YIELD node \
        RETURN n',
        {
          identity: neo4j.int(identity),
          labels,
          keys: Object.keys(properties),
          values: Object.values(properties)
        }
      )
      .then((result: ResultShape) => {
        session.close();
        if (result.records.length <= 0) {
          throw new Error('Relationship with id: "' + identity + '" does not exist');
        }
        return { ...{}, ...(result.records[0].get('n') as NodeFieldShape) };
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public deleteNode(identity: number) {
    const session = neo4jDriver.session();
    return session
      .run('MATCH (n) WHERE ID(n) = $identity DELETE n', { identity: neo4j.int(identity) })
      .then((result: ResultShape) => {
        session.close();
        return 0;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  /* Neo4j CRUD - Relationship */
  public readRelationship(identity: number) {
    const session = neo4jDriver.session();
    return session
      .run('MATCH ()-[r]->() WHERE ID(r) = {identity} RETURN r', { identity: neo4j.int(identity) })
      .then((result: ResultShape) => {
        session.close();
        return result.records.length > 0 ? { ...{}, ...(result.records[0].get('r') as RelationshipFieldShape) } : null;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public createRelationship(type: string = '', start: number, end: number, properties: any = {}) {
    const session = neo4jDriver.session();
    return session
      .run(
        'MATCH (s),(o) WHERE ID(s) = $start AND ID(o) = $end \
        CREATE (s)-[r' +
          toRelationshipTypeString(type) +
          ']->(o) \
        SET r = $properties \
        RETURN r',
        { type, start: neo4j.int(start), end: neo4j.int(end), properties }
      )
      .then((result: ResultShape) => {
        session.close();
        return result.records.length > 0 ? { ...{}, ...(result.records[0].get('r') as RelationshipFieldShape) } : null;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  public updateRelationship(identity: number, type: string = '', start: number, end: number, properties: any = {}) {
    const session = neo4jDriver.session();
    if (type === '') {
      return session
        .run(
          'MATCH ()-[r]->() \
          WHERE ID(r) = $identity \
          CALL apoc.create.setRelProperties(r, $keys, $values) YIELD rel \
          RETURN rel',
          {
            identity: neo4j.int(identity),
            type,
            keys: Object.keys(properties),
            values: Object.values(properties)
          }
        )
        .then((result: ResultShape) => {
          session.close();
          return result.records.length > 0 && result.records[0].get('rel')
            ? { ...{}, ...(result.records[0].get('rel') as RelationshipFieldShape) }
            : null;
        })
        .catch((error: any) => {
          session.close();
          throw error;
        });
    } else {
      return session
        .run(
          'MATCH ()-[r]->() \
          WHERE ID(r) = $identity \
          CALL apoc.create.setRelProperties(r, $keys, $values) YIELD rel \
          WITH rel\
          CALL apoc.refactor.setType(rel, $type) YIELD output,error\
          RETURN output,error AS typeError',
          {
            identity: neo4j.int(identity),
            type,
            keys: Object.keys(properties),
            values: Object.values(properties)
          }
        )
        .then((result: ResultShape) => {
          session.close();
          if (result.records.length <= 0) {
            throw new Error('Relationship with id: "' + identity + '" does not exist');
          }
          if (result.records[0].get('typeError')) {
            throw new Error(result.records[0].get('typeError') as string);
          }
          return { ...{}, ...(result.records[0].get('output') as RelationshipFieldShape) };
        })
        .catch((error: any) => {
          session.close();
          throw error;
        });
    }
  }

  public deleteRelationship(identity: number) {
    const session = neo4jDriver.session();
    return session
      .run('MATCH ()-[r]->() WHERE ID(r) = $identity DELETE r', { identity: neo4j.int(identity) })
      .then((result: ResultShape) => {
        session.close();
        return 0;
      })
      .catch((error: any) => {
        session.close();
        throw error;
      });
  }

  private movieModal(record: RecordShape): MovieShape {
    return {
      title: (record.get('movie') as NodeFieldShape).properties.title,
      released: (record.get('movie') as NodeFieldShape).properties.released,
      tagline: (record.get('movie') as NodeFieldShape).properties.tagline
    };
  }

  private nodeModal(field: NodeFieldShape): NodeShape {
    return {
      ...field,
      identity: field.identity,
      properties: field.properties
    };
  }

  private relationshipModal(field: RelationshipFieldShape): RelationshipShape {
    return {
      ...field,
      identity: field.identity,
      start: field.start,
      end: field.end,
      properties: field.properties
    };
  }
}
