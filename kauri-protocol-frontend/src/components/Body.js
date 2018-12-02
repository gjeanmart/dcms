import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Home from '../pages/Home';
import Spaces from '../pages/Spaces';
import CreateSpace from '../pages/CreateSpace';
import ViewSpace from '../pages/ViewSpace';
import CreateRevision from '../pages/CreateRevision';
import ViewRevision from '../pages/ViewRevision';

class Body extends Component {

  constructor (props){
    super(props);
    this.state = {};
  }

  render() {
      return (
        <div>
          <Route
            path='/'
            exact={true}
            render={()=><Home />}
          />
          <Route
            path='/space'
            exact={true}
            render={(props)=><Spaces {...this.props} />}
          />
          <Route
            path='/space-create'
            exact={true}
            render={(props)=><CreateSpace {...this.props} />}
          />
          <Route
            path='/space/:space'
            exact={true}
            render={(props)=><ViewSpace space={props.match.params.space} {...this.props} />}
          />
          <Route
            path='/space/:space/revision/:revision'
            exact={true}
            render={(props)=><ViewRevision space={props.match.params.space} revisionHash={props.match.params.revision} {...this.props} />}
          />
          <Route
            path='/space/:space/revision-create'
            exact={true}
            render={(props)=><CreateRevision space={props.match.params.space} {...this.props} />}
          />

      </div>
      );
  }
}
export default Body;