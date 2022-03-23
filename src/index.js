import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './components/TodoList.css';
import './components/Sidebar.css';
import reportWebVitals from './reportWebVitals';
import TodoList from './components/TodoList';
import Sidebar from './components/Sidebar';

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = {currentList: 0};
    this.handleListChange = this.handleListChange.bind(this);
  }

  handleListChange(listIndex) {
    this.setState({currentList: listIndex});
  }
  
  render() {
    return (
      <div className="container">
        <TodoList currentList={this.state.currentList}/>
        <Sidebar onListChange={this.handleListChange} />
      </div>
    );
  }
}

ReactDOM.render(
  <TodoList />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
