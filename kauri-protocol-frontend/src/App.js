import React, { Component } from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import './App.css';

import Body from './components/Body';
import Header from './components/Header';
import Loading from './components/Loading';

import Kauri from "kauri-protocol";
import axios from 'axios';

class App extends Component {

  constructor (props){
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const resp = await axios.get(process.env.REACT_APP_TRUFFLE_ENDPOINT + '/ContentSpaceRegistry/all');

    let kauri = await Kauri.init({
      'connections': {
          'ethereum': "no required", 
          'ipfs': process.env.REACT_APP_IPFS_ENDPOINT
      }, 
      'registryArtifact': resp.data[0],
      'registryAddress': process.env.REACT_APP_REGISTRY_CONTRACT_ADDRESS,
      'web3': window.web3
    });

    this.setState({kauri});
  }

  render() {
    if (this.state.kauri === undefined) {
      return (<Loading />);
    }

    return (
    <Router>
      <div>
        <Header {...this.state} />
        <Body {...this.state} />
      </div>
    </Router>
    );
  }
}

export default App;
