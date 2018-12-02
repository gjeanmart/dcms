import React, { Component } from 'react';
import ShowRevision from './ShowRevision';

class SpaceLatestRevision extends Component {

  render() {
	return (
	    <div>
	    	<h4>Latest Revision</h4>

	      	{!this.props.space.lastRevision &&
	        <div>
	          No revision
	        </div>
	      	}

	      	{this.props.space.lastRevision &&
	        <div>
	          <ShowRevision space={this.props.space.id} revisionHash={this.props.space.lastRevision} kauri={this.props.kauri} />
	        </div>
	      	}

	    </div>
	);
  }
}

export default SpaceLatestRevision;