import React from 'react';
import socketClient from 'socket.io-client';
import TodoList from './TodoList';
import Login from './Login';
import { v4 as uuidv4 } from 'uuid';

class DataHandler extends React.Component {
  constructor(props) {
    super(props);

    this.state = { 
      currentList: JSON.parse(localStorage.getItem('currentList')) || 0, 
      itemLists: JSON.parse(localStorage.getItem('itemLists')) || [], 
      listTitles: JSON.parse(localStorage.getItem('listTitles')) || [], 
      darkmode: JSON.parse(localStorage.getItem('darkmode')) || false, 
      mode: 0, // Mode 0: "Guest Mode" | Mode 1: "Online Mode"
      loggedIn: false,
      username: '',
      password: '',
      errorMessage: '',
      showError: false
    };

    this.handleItemSubmit = this.handleItemSubmit.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleListCreate = this.handleListCreate.bind(this);
    this.handleListClick = this.handleListClick.bind(this);
    this.handleListDelete = this.handleListDelete.bind(this);
    this.handleListTitleEdit = this.handleListTitleEdit.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
    this.handleDarkmodeToggle = this.handleDarkmodeToggle.bind(this);

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleGuest = this.handleGuest.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleCreateAccount = this.handleCreateAccount.bind(this);
  }

  // Saves all data used by the TodoList to a remote server
  saveDataToServer() {
    const listData = {
      currentList: this.state.currentList,
      itemLists: this.state.itemLists,
      listTitles: this.state.listTitles,
      darkmode: this.state.darkmode
    }
    this.socket.emit('save', listData);
    console.log('Data saved to server.');
  }

  // Saves all data used by the TodoList to local storage as JSON objects
  saveDataToLocalStorage() {
    localStorage.setItem('currentList', JSON.stringify(this.state.currentList));  
    localStorage.setItem('itemLists', JSON.stringify(this.state.itemLists));
    localStorage.setItem('listTitles', JSON.stringify(this.state.listTitles));
    localStorage.setItem('darkmode', JSON.stringify(this.state.darkmode));
    console.log('Data saved to local storage.');
  }

  loadDataFromServer() {
    this.socket.emit('load'); // Sends a load request to the server
  }

  loadDataFromLocalStorage() {
    this.setState({
      currentList: JSON.parse(localStorage.getItem('currentList')) || 0,
      itemLists: JSON.parse(localStorage.getItem('itemLists')) || [],
      listTitles: JSON.parse(localStorage.getItem('listTitles')) || [],
      darkmode: JSON.parse(localStorage.getItem('darkmode')) || false
    });
    console.log('Data loaded from local storage.');
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  // Sets the loggedIn state to true without being logged in.
  // This will open the TodoList and load the data in local storage.
  handleGuest(event) {
    event.preventDefault();
    this.loadDataFromLocalStorage();
    this.setState({ loggedIn: true, mode: 0, showError: false });
  }

  // Sends an event to the server telling it to link this socket to the users data
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.username == '' || this.state.password == '') return;
    const credentials = {
      username: this.state.username,
      password: this.state.password,
      time: Date.now()
    }
    this.socket.emit('Login', credentials);
  }

  // Sends an event to the server to delink the user data from this socket
  handleLogout(event) {
    event.preventDefault();
    this.socket.emit('Logout');
    this.setState({ 
      loggedIn: false, 
      mode: 0,
      username: '',
      password: ''
    });
  }

  handleCreateAccount(event) {
    event.preventDefault();  
    if (this.state.username == '' || this.state.password == '') return;
    const credentials = {
      username: this.state.username,
      password: this.state.password
    }
    this.socket.emit('create-account', credentials);
  }

  handleListDelete() {
    this.setState(function(prevState, props) {
      const index = prevState.currentList;
      var iLists = [];
      var lTitles = [];
      for (var i = 0; i < prevState.itemLists.length; i++) {
        if (i != index) {
          iLists.push(prevState.itemLists[i]);
          lTitles.push(prevState.listTitles[i]);
        }
      }
      const cList = (prevState.currentList <= 0) ? 0 : (prevState.currentList - 1);
      return {
        itemLists: iLists,
        listTitles: lTitles,
        currentList: cList
      }
    });
  }

  handleListClick(itemId) {
    this.setState(function(prevState, props) {
      const iList = prevState.itemLists[prevState.currentList];
      const index = this.getListItemIndex(prevState, itemId);
      const aList = [...iList.slice(0, index),
        {body: iList[index].body, color: iList[index].color, done: !iList[index].done, id: iList[index].id},
        ...iList.slice(index + 1)];
      return {
        itemLists: [
          ...prevState.itemLists.slice(0, prevState.currentList),
          aList,
          ...prevState.itemLists.slice(prevState.currentList + 1)
        ]
      }
    });
  }

  getListItemIndex(prevState, itemId) {
    const iList = prevState.itemLists[prevState.currentList];
    for (var i = 0; i < iList.length; i++) {
      if (iList[i].id == itemId) {
        return i;
      }
    }
  }

  handleListCreate(event) {
    event.preventDefault();
    this.setState(function(prevState, props) {
      const newListIndex = prevState.itemLists.length;
      const newListTitleId = uuidv4();
      return {
        itemLists: [...prevState.itemLists, []],
        listTitles: [...prevState.listTitles, {title: `L${newListIndex}st`, id: newListTitleId}]
      }
    });
  }

  handleItemSubmit(value) {
    this.setState(function(prevState, props) {
      const index = prevState.currentList;
      const uuid = uuidv4();
      const iList = [...prevState.itemLists[index], {body: value, color: '#000000', done: false, id: uuid}];

      return {
        itemLists: [
          ...prevState.itemLists.slice(0, index),
          iList,
          ...prevState.itemLists.slice(index + 1)
        ]
      }
    });
  }

  handleItemDelete(itemId) {
    this.setState(function(prevState, props) {
      const index = this.getListItemIndex(prevState, itemId);
      const iList = [
        ...prevState.itemLists[prevState.currentList].slice(0, index),
        ...prevState.itemLists[prevState.currentList].slice(index + 1)
      ]
      return {
        itemLists: [
          ...prevState.itemLists.slice(0, prevState.currentList),
          iList,
          ...prevState.itemLists.slice(prevState.currentList + 1)
        ]
      }
    });
  }

  handleListChange(index) {
    this.setState({currentList: index});
  }

  handleListTitleEdit(value) {
    this.setState(function(prevState, props) {
      const index = prevState.currentList;
      const lTitle = {title: value, id: prevState.listTitles[index].id};
      return {
        listTitles: [
          ...prevState.listTitles.slice(0, index),
          lTitle,
          ...prevState.listTitles.slice(index + 1)
        ]
      }
    });
  }

  handleDarkmodeToggle() {
    this.setState(function(prevState, props) {
      return {
        darkmode: !prevState.darkmode
      }
    });
  }

  componentDidMount() {
    console.log('component mounted');
    this.socket = socketClient('http://127.0.0.1:8080');

    // The server will send data as a 'data' event, the state is then set to match the new data
    this.socket.addEventListener('data', (listData) => {
      this.setState({ 
        currentList: listData.currentList,
        itemLists: listData.itemLists,
        listTitles: listData.listTitles,
        darkmode: listData.darkmode
      });
    });

    this.socket.addEventListener('login-response', (response) => {
      console.log(response);
    });

    this.socket.addEventListener('error-message', (error) => {
      this.setState({ showError: true, errorMessage: error });
    });

    this.socket.addEventListener('login-confirm', () => {
      this.loadDataFromServer();
      this.setState({ loggedIn: true, mode: 1, showError: false });
    });
  }

  render() {
    const listData = {
      currentList: this.state.currentList,
      itemLists: this.state.itemLists,
      listTitles: this.state.listTitles,
      darkmode: this.state.darkmode
    }
    if (this.state.mode == 0) {
      this.saveDataToLocalStorage(); 
    } else {
      this.saveDataToServer();
    }
    var renderObject;
    if (this.state.loggedIn) {
      renderObject = ( 
        <TodoList listData={listData} 
        onItemSubmit={this.handleItemSubmit}
        onListChange={this.handleListChange}
        onListCreate={this.handleListCreate}
        onListClick={this.handleListClick}
        onListDelete={this.handleListDelete}
        onListTitleEdit={this.handleListTitleEdit}
        onItemDelete={this.handleItemDelete}
        onDarkmodeToggle={this.handleDarkmodeToggle}
        onLogout={this.handleLogout} />
      );
    } else {
      renderObject = (
        <Login 
        username={this.state.username} 
        password={this.state.password} 
        onUsernameChange={this.handleUsernameChange}
        onPasswordChange={this.handlePasswordChange} 
        onSubmit={this.handleSubmit} 
        onGuest={this.handleGuest}
        onCreateAccount={this.handleCreateAccount} 
        showError={this.state.showError}
        errorMessage={this.state.errorMessage} />
      );
    }
    return (
      < >
        {renderObject}
      </ >
    )
  }
}

export default DataHandler;

