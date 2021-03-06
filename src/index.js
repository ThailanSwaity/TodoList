import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './components/TodoList.css';
import './components/Sidebar.css';
import './components/Login.css';
import reportWebVitals from './reportWebVitals';
import DataHandler from './components/DataHandler';

ReactDOM.render(
  <DataHandler />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
