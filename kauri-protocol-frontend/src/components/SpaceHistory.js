import React, { Component } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Timestamp from 'react-timestamp';
import Loading from './Loading';
import Error from './Error';

class SpaceHistory extends Component {

  constructor (props){
    super(props);
    this.state = {};

    this.renderRow = this.renderRow.bind(this);
    this.approveRevision = this.approveRevision.bind(this);
    this.rejectRevision = this.rejectRevision.bind(this);
    this.loadRevisions = this.loadRevisions.bind(this);
  }

  async componentDidMount() {
    this.loadRevisions(this.props.space.id)
  }

  async loadRevisions(space) {
    try {
      this.setState({'revisions': undefined})
      let revisions = await this.props.kauri.getSpaceRevisions(space);
      this.setState({'revisions': revisions})
    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }

  async approveRevision(hash) {
    await this.props.kauri.approveRevision(this.props.space.id, hash);
    this.loadRevisions(this.props.space.id)
  }

  async rejectRevision(hash) {
    await this.props.kauri.rejectRevision(this.props.space.id, hash);
    this.loadRevisions(this.props.space.id)
  }

  render() {
    if (this.state.hasError) {
      return (<Error {...this.state} />);
    }
    if (this.state.revisions === undefined) {
      return (<Loading />);
    }

  	return (
  	    <div>
  	    	<h4>History</h4>

          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Author</th>
                <th>Parent</th>
                <th>State</th>
                <th>Timestamp</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              { this.state.revisions.map(this.renderRow) }
            </tbody>
          </Table>

  	    </div>
  	);
  }

 renderRow(props) {
    return (
      <tr key={props.hash}>
        <td><Link to={`/space/${this.props.space.id}/revision/${props.hash}`}>{props.hash}</Link></td>
        <td>{props.author}</td>
        <td><Link to={`/space/${this.props.space.id}/revision/${props.parent}`}>{props.parent}</Link></td>
        <td>{props.state}</td>
        <td><Timestamp time={props.timestamp} format='full' /></td>
        <td>
          {props.state === "PENDING" &&
            <div>
              <Button onClick={() => { this.approveRevision(props.hash) }}>Approve</Button>
              <Button onClick={() => { this.rejectRevision(props.hash) }}>Reject</Button>
            </div>
          }
        </td>
      </tr>
    );
  }

}

export default SpaceHistory;