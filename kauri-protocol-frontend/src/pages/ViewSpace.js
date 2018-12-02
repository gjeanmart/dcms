import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Loading from '../components/Loading';
import Error from '../components/Error';
import SpaceHeader from '../components/SpaceHeader';
import SpaceLatestRevision from '../components/SpaceLatestRevision';
import SpaceHistory from '../components/SpaceHistory';

class ViewSpace extends Component {

  constructor (props){
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    try {
      let space = await this.props.kauri.getSpace(this.props.space);
      this.setState({'space': space})
    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }

  render() {
    if (this.state.hasError) {
      return (<Error {...this.state} />);
    }
    if (this.state.space === undefined) {
      return (<Loading />);
    }

    return (
      <div>
        <h3>Space {this.state.space.id} [<Link to={`/space/${this.state.space.id}/revision-create`}>New revision</Link>]</h3>
        <SpaceHeader space={this.state.space} />
        <SpaceLatestRevision space={this.state.space} kauri={this.props.kauri} />
        <SpaceHistory space={this.state.space} kauri={this.props.kauri} />
    </div>
    );
  }
}

export default ViewSpace;