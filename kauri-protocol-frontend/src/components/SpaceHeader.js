import React, { Component } from 'react';

class SpaceHeader extends Component {

  render() {
      return (
        <div>
        	<h4>Header</h4>
        	<div>name: {this.props.space.id}</div>
        	<div>owner: {this.props.space.owner}</div>
        	<div>lastRevision: {this.props.space.lastRevision}</div>
        </div>
      );
  }
}

export default SpaceHeader;