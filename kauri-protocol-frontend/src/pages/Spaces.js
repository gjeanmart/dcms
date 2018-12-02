import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Loading from '../components/Loading';
import Error from '../components/Error';

class Spaces extends Component {

  constructor (props){
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    try {
      let spaces = await this.props.kauri.getAllSpaces();
      this.setState({'spaces': spaces})

    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }

  render() {
    if (this.state.hasError) {
      return (<Error {...this.state} />);
    }
    if (this.state.spaces === undefined) {
      return (<Loading />);
    }

    return (
      <div>
        <h3>Spaces</h3>

        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            { this.state.spaces.map(this.renderRow) }
          </tbody>
        </Table>

    </div>
    );
  }

 renderRow(props) {
    return (
      <tr key={props.id}>
        <td>{props.id}</td>
        <td>{props.owner}</td>
        <td><Link to={`/space/${props.id}`}>Go</Link></td>
      </tr>
    );
  }

}

export default Spaces;