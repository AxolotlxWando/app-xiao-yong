import settings from '@gqlapp/config';
import { v1 as neo4j } from 'neo4j-driver';
import { log } from '@gqlapp/core-common';

const {
  dbNeo4j: {
    connection: { host, user, password }
  }
} = settings;

function testConnection(neo4jDriver) {
  log.info(`Connecting to Neo4j...`);
  const session = neo4jDriver.session();
  return session
    .run('RETURN apoc.versions();')
    .then(result => {
      session.close();
      const test = result.records[0].get('apoc.version()');
      if (test) {
        log.info(`Successfully connected to Neo4j at: ${host}, APOC version: ${test}`);
      } else {
        throw new Error();
      }
      return 0;
    })
    .catch(() => {
      session.close();
      throw new Error(`Connection to Neo4j seemed to succeed at: ${host} but APOC doesn't seem to be installed.`);
    });
}

if (!host || !user || !password) {
  throw new Error(
    "You need to supply Neo4j's bolt connection details (host, user and password) either through environment variable or `/config/dbNeo4j.js`"
  );
}

let neo4jDriver;

try {
  neo4jDriver = neo4j.driver(host, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true
  });
  testConnection(neo4jDriver);
} catch (error) {
  throw new Error(
    `Connection to Neo4j database failed, check your Neo4j instance's endpoint and login details (${error.toString()})`
  );
}

const _neo4jDriver = neo4jDriver;

export { _neo4jDriver };
export default _neo4jDriver;
