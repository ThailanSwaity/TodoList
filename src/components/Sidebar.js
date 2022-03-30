import React from 'react';

class Sidebar extends React.Component {
  render() {
    const todoLists = this.props.listTitles;
    return (
      <div className={"Sidebar " + this.props.viewmode}>
        <button onClick={this.props.onListCreate} className="NewListButton">+</button>
        <ListsTodo currentList={this.props.currentList} onClick={this.props.onListChange} items={todoLists}/>
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
    const listId = event.target.id;
    const index = this.getIndex(listId);
    this.props.onClick(index);
  }

  getIndex(titleId) {
    const items = this.props.items;
    for (var i = 0; i < items.length; i++) {
      if (titleId === items[i].id) {
        return i;
      }
    }
  }

  shorten(title) {
    return (title.charAt(0) + title.charAt(1) + title.charAt(2));
  }

  render() {
    const items = this.props.items.map((item) => {
      const index = this.props.currentList;
      const cName = (this.props.items[index].id == item.id) ? "selected" : "";
      return <SidebarItem className={cName} key={item.id} id={item.id} onClick={this.handleClick}>{this.shorten(item.title)}</SidebarItem>;
    });
    return (
      <ul className="ListsTodo">
        {items} 
      </ul>
    );
  }
}

class SidebarItem extends React.Component {
  render() {
    return (
      <li className={this.props.className} onClick={this.props.onClick} id={this.props.id}>
        {this.props.children}
      </li>
    );
  }
}

export default Sidebar;
