import ServerModule from '@gqlapp/module-server-ts';

import Neo4jCrud from './cypher';
import schema from './schema';
import createResolvers from './resolvers';

export default new ServerModule({
  schema: [schema],
  // createResolversFunc: [createResolvers],
  createContextFunc: [() => ({ Post: new Neo4jCrud() })]
});
