import React, { Component } from 'react';
import { FormGroup, FormControl, ControlLabel, Button, Modal } from 'react-bootstrap';
import { Link } from "react-router-dom";

class CreateSpace extends Component {

  constructor (props){
    super(props);
    this.state = {'space': '', 'owner': props.kauri.account};

    this.validate      = this.validate.bind(this);
    this.handleChange  = this.handleChange.bind(this);
    this.createSpace   = this.createSpace.bind(this);
  }


  validate(field) {
    let length = 0;
    switch(field) {
      case "space":
          length = this.state.space.length;
          if (length > 0) return 'success';
          return 'error';

      case "owner":
          length = this.state.owner.length;
          if (length > 0) return 'success';
          return 'error';

      default:
          return null;
    } 
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  async createSpace() {
    //TODO check if all fields valid
    let result = await this.props.kauri.createSpace(this.state.space, this.state.owner);
    this.setState({'result': result})
  }

  render() {
      return (
        <div>
          <h3>Create Space</h3>

          <form>
            <FormGroup
              controlId="space"
              validationState={this.validate("space")}
            >
              <ControlLabel>Space Name</ControlLabel>
              <FormControl
                type="text"
                name="space"
                value={this.state.space}
                placeholder="Enter a space name"
                onChange={this.handleChange}
              />
            </FormGroup>

            <FormGroup
              controlId="owner"
              validationState={this.validate("owner")}
            >
              <ControlLabel>Owner</ControlLabel>
              <FormControl
                type="text"
                name="owner"
                value={this.state.owner}
                placeholder="Enter owner"
                onChange={this.handleChange}
              />
            </FormGroup>

            <Button type="button" onClick={this.createSpace}>Submit</Button>
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
              Space '{this.state.result.id}' successfully created !
            </Modal.Body>
            <Modal.Footer>
              <Link to="/space"><Button>See spaces</Button></Link>
            </Modal.Footer>
          </Modal>
          }

      </div>
      );
  }
}

export default CreateSpace;