export default (pubsub: any) => ({
  Query: {
    async neo4jMovies(obj: any, args: any, context: any) {
      const movies = await context.Neo4jCrud.moviesQuery(args.searchKeyword);
      // console.log(JSON.stringify(movies, null, 2));
      return movies;
    },
    async getAllNodes(obj: any, args: any, context: any) {
      return context.Neo4jCrud.getAllNodes();
    },
    async getAllNodesAndRelationships(obj: any, args: any, context: any) {
      return context.Neo4jCrud.getAllNodesAndRelationships();
    },
    async readNode(obj: any, args: any, context: any) {
      return context.Neo4jCrud.readNode(args.identity);
    },
    async readRelationship(obj: any, args: any, context: any) {
      return context.Neo4jCrud.readRelationship(args.identity);
    }
  },
  Mutation: {
    async createNode(obj: any, args: any, context: any) {
      return context.Neo4jCrud.createNode(args.labels, args.properties);
    },
    async updateNode(obj: any, args: any, context: any) {
      return context.Neo4jCrud.updateNode(args.identity, args.labels, args.properties);
    },
    async deleteNode(obj: any, args: any, context: any) {
      return context.Neo4jCrud.deleteNode(args.identity);
    },
    async createRelationship(obj: any, args: any, context: any) {
      return context.Neo4jCrud.createRelationship(args.type, args.start, args.end, args.properties);
    },
    async updateRelationship(obj: any, args: any, context: any) {
      return context.Neo4jCrud.updateRelationship(args.identity, args.type, args.start, args.end, args.properties);
    },
    async deleteRelationship(obj: any, args: any, context: any) {
      return context.Neo4jCrud.deleteRelationship(args.identity);
    }
  }
});
