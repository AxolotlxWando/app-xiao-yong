import React from 'react';
import { Route, NavLink } from 'react-router-dom';

import Neo4jCrud from './containers/Neo4jCrud';
import ClientModule from '@gqlapp/module-client-react';
import { MenuItem } from '@gqlapp/look-client-react';
import resources from './locales';

export default new ClientModule({
  route: [<Route exact path={__TEST__ ? '/neo4j-crud' : '/neo4j-crud'} component={Neo4jCrud} />],
  navItem: [
    <MenuItem key="/neo4j-crud">
      <NavLink to="/neo4j-crud" className="nav-link" activeClassName="active">
        Neo4jCrud
      </NavLink>
    </MenuItem>
  ],
  localization: [{ ns: 'counter', resources }]
});
