import React, { Component } from 'react';
import ShowRevision from '../components/ShowRevision';

class ViewRevision extends Component {

  render() {
    return (
      <div>
        <h3>Revision {this.props.revisionHash} [space: {this.props.space}]</h3>
        <ShowRevision space={this.props.space} revisionHash={this.props.revisionHash} kauri={this.props.kauri} />
    </div>
    );
  }
}

export default ViewRevision;