import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from 'react-bootstrap';

class Header extends Component {

    render() {
        return (
          <div>

			<Navbar>
			  <Navbar.Header>
			    <Navbar.Brand>
			      <a href="#home">Kauri protocol - Space explorer</a>
			    </Navbar.Brand>
			  </Navbar.Header>
			  <Nav>
			    <NavItem eventKey={1} href="#"><Link to="/">Home</Link></NavItem>
			    <NavItem eventKey={2} href="#"><Link to="/space">Spaces</Link></NavItem>
			    <NavItem eventKey={3} href="#"><Link to="/space-create">Create space</Link></NavItem>

    			<Navbar.Text pullRight>Registry: {this.props.kauri.registry.instance.address}</Navbar.Text>
			  </Nav>
			</Navbar>
        </div>
        );
    }
}

export default Header;