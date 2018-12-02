import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Loading from './Loading';
import Error from './Error';
import Timestamp from 'react-timestamp';

class ShowRevision extends Component {

  constructor (props){
    super(props);
    this.state = {};
    this.loadRevision = this.loadRevision.bind(this);
  }

  async componentDidMount() {
    this.loadRevision(this.props.space, this.props.revisionHash)
  }

  async componentWillReceiveProps(nextProps) {
       this.loadRevision(nextProps.space, nextProps.revisionHash)
  }

  async loadRevision(space, revisionHash) {
    try {
        this.setState({'revision': undefined})
        let revision = await this.props.kauri.getRevision(space, revisionHash);
        this.setState({'revision': revision})
    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }

  render() {
    if (this.state.hasError) {
      return (<Error {...this.state} />);
    }
    if (this.state.revision === undefined) {
      return (<Loading />);
    }

  	return (
  	    <div>
          <h5>Metadata</h5>
          <div>Space: <Link to={`/space/${this.state.revision.space}`}>{this.state.revision.space}</Link></div>
          <div>Hash: <Link to={`/space/${this.state.revision.space}/revision/${this.state.revision.revisionHash}`}>{this.state.revision.revisionHash}</Link></div>
          <div>Parent: <Link to={`/space/${this.state.revision.space}/revision/${this.state.revision.parent}`}>{this.state.revision.parent}</Link></div>
          <div>Author: {this.state.revision.author}</div>
          <div>Timestamp: <Timestamp time={this.state.revision.timestamp} format='full' /></div>
          <div>State: {this.state.revision.state}</div>
          <div>Key/Value: {JSON.stringify(this.state.revision.metadata)}</div>

          <h5>Content</h5>
          <textarea readOnly value={this.state.revision.content.toString('utf8')}></textarea>
  	    </div>
  	  );
  }
}

export default ShowRevision;