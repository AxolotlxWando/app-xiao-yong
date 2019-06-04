import React from 'react';
import { Route, NavLink } from 'react-router-dom';

import Counter from './containers/Counter';
import counters from './counters';
import ClientModule from '@gqlapp/module-client-react';
import { MenuItem } from '@gqlapp/look-client-react';
import resources from './locales';

export default new ClientModule(counters, {
  route: [<Route exact path={__TEST__ ? '/counter' : '/counter'} component={Counter} />],
  navItem: [
    <MenuItem key="/counter">
      <NavLink to="/counter" className="nav-link" activeClassName="active">
        Counter
      </NavLink>
    </MenuItem>
  ],
  localization: [{ ns: 'counter', resources }]
});
