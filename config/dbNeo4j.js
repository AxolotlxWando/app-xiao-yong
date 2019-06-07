const dbNeo4j = {
  connection: {
    host: process.env.DB_NEO4J_HOST || 'bolt://localhost:17687',
    user: process.env.DB_NEO4J_USER || 'neo4j',
    password: process.env.DB_NEO4J_PASSWORD || ''
  }
};

export default dbNeo4j;
