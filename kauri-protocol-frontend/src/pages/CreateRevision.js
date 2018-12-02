import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Button, DropdownButton, MenuItem, Modal } from 'react-bootstrap';
import { Link } from "react-router-dom";
import Loading from '../components/Loading';
import Error from '../components/Error';
import KeyList from "../components/KeyList";

class CreateRevison extends Component {

  constructor (props){
    super(props);
    this.state = {'content': '', 'metadata': []};

    this.validate       = this.validate.bind(this);
    this.handleChange   = this.handleChange.bind(this);
    this.createRevision = this.createRevision.bind(this);
    this.renderMenuItem = this.renderMenuItem.bind(this);
    this.handleDropdown = this.handleDropdown.bind(this);
    this.handleMetadataChange = this.handleMetadataChange.bind(this);


  }

  async componentDidMount() {
    try {
      let space = await this.props.kauri.getSpace(this.props.space);
      space.revisions = await this.props.kauri.getSpaceRevisions(this.props.space);
      let defaultParent = (space.revisions.length > 0) ? space.revisions[space.revisions.length-1].hash : null
      this.setState({'space': space, 'parent': defaultParent});
      if(defaultParent) {
        this.handleDropdown(defaultParent);
      }

    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }


  validate(field) {
    let length = 0;
    switch(field) {
      case "space":
          length = this.state.space.length;
          if (length > 0) return 'success';
          return 'error';

      default:
          return null;
    } 
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleMetadataChange(metadata) {
    this.setState({ metadata });
  }

  async handleDropdown(value) {
    this.setState({ 'parent': value });

    try {
        let revision = await this.props.kauri.getRevision(this.state.space.id, value);

        let metadata = Object.entries(revision.metadata).map(([key, value]) => ({key,value}));

        this.setState({'metadata': metadata, 'content': revision.content.toString('utf8')})

    } catch(e) {
      this.setState({hasError: true, message: e.toString()})
    }
  }

  async createRevision() {
    console.log(this.state);

    var attributes = {};
    this.state.metadata.map(k => attributes[k.key] = k.value)

    let result = await this.props.kauri.createRevision(
      this.props.space, 
      new Buffer(this.state.content), 
      attributes, 
      this.state.parent);

    await this.props.kauri.pushRevision(this.props.space, result);
    console.log(result)
    this.setState({'result': result})

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
        <h3>Create Revision</h3>

        <form>
          <FormGroup controlId="space">
            <ControlLabel>Space Name</ControlLabel>
            <FormControl
              type="text"
              name="space"
              value={this.state.space.id}
              readOnly
            />
          </FormGroup>

          <FormGroup controlId="parent">
            <ControlLabel>Parent</ControlLabel>
            <DropdownButton
              title={this.state.parent}
              key={this.state.parent}
              onSelect={this.handleDropdown} 
            >
              { this.state.space.revisions.map(this.renderMenuItem) }
            </DropdownButton>
          </FormGroup>

          <FormGroup controlId="content">
            <ControlLabel>Content</ControlLabel>
            <FormControl componentClass="textarea"  
                         name="content" 
                         value={this.state.content} 
                         onChange={this.handleChange} />
          </FormGroup>

          <KeyList items={this.state.metadata} onItemChanged={this.handleMetadataChange} />

          <Button type="button" onClick={this.createRevision}>Submit</Button>
        </form>

          {this.state.result &&
          <Modal
            show={this.state.result}
            container={this}
            aria-labelledby="contained-modal-title">
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title">Success</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              New revision '{this.state.result}' successfully created and published!
            </Modal.Body>
            <Modal.Footer>
              <Link to={`/space/${this.state.space.id}`}><Button>See Space {this.state.space.id}</Button></Link>
            </Modal.Footer>
          </Modal>
          }

    </div>
    );
  }

 renderMenuItem(props) {
    return (
      <MenuItem eventKey={props.hash} key={props.hash}>{props.hash}</MenuItem>
    );
  }
}

export default CreateRevison;