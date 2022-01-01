import React, { Component } from "react";
import SolidityDriveContract from "./contracts/SolidityDrive.json";
import getWeb3 from "./getWeb3";
import { StyledDropZone } from 'react-drop-zone';
import { FileIcon, defaultStyles } from 'react-file-icon'; 
import "react-drop-zone/dist/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import { Table } from 'reactstrap';
import fileReaderPullStream from 'pull-file-reader';
import ipfs from './ipfs';
import "./App.css";

class App extends Component {
  state = { solidityDrive: [], web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SolidityDriveContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SolidityDriveContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getFiles);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };

  getFiles = async () => { 

    try {
      const { account, contract } = this.state;
      let filesLength = await contract.methods.getLength().call({from:account[0]});
      let files = [];
  
      for(let i = 0; i < filesLength; i++){
        let file = await contract.methods.getFile(i).call({from:account[0]});
        files.push(file);
      }
  
      this.setState({solidityDrive: files});
  
    } catch (error) {
      console.log(error);
    }
    
  }

  onDrop = async (file) => {
    try {
      const { contract, account } = this.state;
      const stream = fileReaderPullStream(file);
      const result = await ipfs.add(stream);


    } catch (error) {
      console.log(error);
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container pt-3">
          <StyledDropZone onDrop={this.onDrop} />
          <Table>
            <thead>
              <tr>
                <th width="7%" scope="row" >Type</th>
                <th className="text-left" >File Name</th>
                <th className="text-right" >Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th><FileIcon  extension="docx" {...defaultStyles.docx} /></th>
                <th className="text-left" >File Name.docx</th>
                <th className="text-right"  >2021/09/11</th>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default App;