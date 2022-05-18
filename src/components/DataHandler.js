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
      screen: 0, // 0: Login screen | 1: todo-list screen
      loggedIn: false,
      username: '',
      password: '',
      banner: { message: '', colour: '#FF0000', show: false },
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
    this.setState(function(prevState, props) { 
      var banner = prevState.banner;
      banner.show = false;
      return {
        loggedIn: true, 
        mode: 0, 
        banner
      }
    });
  }

  // Sends a 'Login'  event to the server with the login information
  login(username, password) {
    const credentials = { 
      username, 
      password,
      time: Date.now() 
    };
    this.socket.emit('Login', credentials);
  }

  // Checks if the username or password are invalid
  // Calls the login function if the username and password are valid
  handleSubmit(event) {
    event.preventDefault();
    if (this.state.username == '' || this.state.password == '' || !this.socket.connected) return;
    this.login(this.state.username, this.state.password);
  }

  // Sends an event to the server to delink the user data from this socket
  handleLogout(event) {
    event.preventDefault();
    this.socket.emit('Logout');
    this.setState({ 
      loggedIn: false, 
      mode: 0,
      screen: 0,
      username: '',
      password: ''
    });
  }

  handleCreateAccount(event) {
    event.preventDefault();  
    if (this.state.username == '' || this.state.password == '' || !this.socket.connected) return;
    const credentials = {
      username: this.state.username,
      password: this.state.password
    }
    this.setState(function(prevState, props) {
      var banner = prevState.banner;
      banner.show = false;
      return {
        banner
      }
    });
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
    this.socket = socketClient('http://10.0.0.166:8080');

    // The server will send data as a 'data' event, the state is then set to match the new data
    this.socket.addEventListener('data', (listData) => {
      this.setState({ 
        currentList: listData.currentList,
        itemLists: listData.itemLists,
        listTitles: listData.listTitles,
        darkmode: listData.darkmode
      });
    });

    // A server event used for when the server cannot confirm a login attempt
    this.socket.addEventListener('login-response', (response) => {
      console.log(response);
    });

    // A server event that displays a red error message on the login screen
    this.socket.addEventListener('error-message', (error) => {
      this.displayBannerMessage(error, '#FF0000');
    });

    // A server event that displays a green confirmation message on the login screen
    this.socket.addEventListener('confirmation', (response) => {
      this.displayBannerMessage(response, '#3BC73B'); 
    });

    // A server event that is triggered when a login is successful
    // The client state changes to display the todolist
    // The banner is then hidden
    this.socket.addEventListener('login-confirm', () => {
      this.loadDataFromServer();
      this.setState(function(prevState, props) { 
        var banner = prevState.banner;
        banner.show = false;
        return {
          loggedIn: true, 
          mode: 1, 
          screen: 1,
          banner
        }
      });
    });

    // When the client regains connection the message banner on the login page is hidden
    // The client will also attempt to log back into thier account if they have lost connection while being logged in
    this.socket.on('connect', () => {
      this.hideBanner();
      if (!this.state.loggedIn && this.state.screen == 1) {
        this.login(this.state.username, this.state.password);
      }
    });

    // Displays a banner message on the login screen letting the user know they have lost connection to the server
    // Sets the loggedIn state to false
    this.socket.on('disconnect', () => {
      this.setState({ loggedIn: false });
      this.displayBannerMessage('Lost connection to the server', '#FF0000');
    });

  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  hideBanner() {
    this.setState(function(prevState, props) {
      var banner = prevState.banner;
      banner.show = false;
      return {
        banner
      }
    });
  }

  displayBannerMessage(message, colour) {
    this.setState({
      banner: {
        message,
        colour,
        show: true
      }
    });
  }

  render() {
    const listData = {
      currentList: this.state.currentList,
      itemLists: this.state.itemLists,
      listTitles: this.state.listTitles,
      darkmode: this.state.darkmode
    }

    if (this.state.loggedIn) {
      if (this.state.mode == 0) {
        this.saveDataToLocalStorage(); 
      } else {
        this.saveDataToServer();
      }
    }

    var renderObject;
    if (this.state.screen == 1) {
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
        banner={this.state.banner} />
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

