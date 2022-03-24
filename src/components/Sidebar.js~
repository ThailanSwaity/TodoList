import React from 'react';

class Sidebar extends React.Component {
  render() {
    const todoLists = this.props.listTitles;
    return (
      <div className="Sidebar">
        <button onClick={this.props.onListCreate} className="NewListButton">+</button>
        <ListsTodo onClick={this.props.onListChange} items={todoLists}/>
      </div>
    );
  }
}

class ListsTodo extends React.Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const listName = event.target.textContent;
    const index = this.getIndex(listName);
    this.props.onClick(index);
  }

  getIndex(textContent) {
    const items = this.props.items;
    for (var i = 0; i < items.length; i++) {
      if (textContent === this.shorten(items[i])) {
        return i;
      }
    }
  }

  shorten(title) {
    return (title.charAt(0) + title.charAt(1) + title.charAt(2));
  }

  render() {
    const items = this.props.items.map((item) => <li onClick={this.handleClick}>{this.shorten(item)}</li>);
    return (
      <ul className="ListsTodo">
        {items} 
      </ul>
    );
  }
}

export default Sidebar;
