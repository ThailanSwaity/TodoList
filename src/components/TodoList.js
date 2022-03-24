import React from 'react';
import Sidebar from './Sidebar';

class TodoList extends React.Component {
  constructor(props) {
    super(props);
    const itemLists = JSON.parse(localStorage.getItem("itemLists"));
    const listTitles = JSON.parse(localStorage.getItem("listTitles"));
    const currentList = JSON.parse(localStorage.getItem("currentList"));
    this.state = {
      itemLists: (itemLists || [[]]), 
      listTitles: (listTitles || ['Chores For Today']), 
      currentList: (currentList || 0)
    };
    this.handleItemSubmit = this.handleItemSubmit.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleListCreate = this.handleListCreate.bind(this);
    this.handleListClick = this.handleListClick.bind(this);
  }
  
  handleListClick(itemTitle) {
    this.setState(function(prevState, props) {
      const iList = prevState.itemLists[prevState.currentList];
      const index = this.getListItemIndex(prevState, itemTitle);
      const aList = [...iList.slice(0, index), 
        {body: iList[index].body, color: iList[index].color, done: !iList[index].done}, 
        ...iList.slice(index + 1)];
      return {
        itemLists: [
          ...prevState.itemLists.splice(0, prevState.currentList),
          aList,
          ...prevState.itemLists.splice(prevState.currentList + 1)
        ]
      }
    });
  }

  getListItemIndex(prevState, itemTitle) {
    const iList = prevState.itemLists[prevState.currentList];
    for (var i = 0; i < iList.length; i++) {
      if (iList[i].body == itemTitle) {
        return i;
      }
    }
  }

  handleListCreate(event) {
    event.preventDefault();
    this.setState(function(prevState, props) {
      const newListIndex = prevState.itemLists.length;
      return {
        currentList: newListIndex,
        itemLists: [...prevState.itemLists, []],
        listTitles: [...prevState.listTitles, `L${newListIndex}st`]
      }
    });
  }

  handleItemSubmit(value) {
    this.setState(function(prevState, props) {
      const index = prevState.currentList;
      const iList = [...prevState.itemLists[index], {body: value, color: '#000000', done: false}];

      return {
        itemLists: [
          ...prevState.itemLists.slice(0, index),
          iList,
          ...prevState.itemLists.slice(index + 1)
        ]
      };
    });
  }

  handleListChange(index) {
    this.setState({currentList: index});
  }

	render() {
    const itemList = this.state.itemLists[this.state.currentList]; 
    const lTitle = this.state.listTitles[this.state.currentList];

    // Use effect might be better for this use case, but the performance difference seems negligible
    localStorage.setItem("itemLists", JSON.stringify(this.state.itemLists));
    localStorage.setItem("listTitles", JSON.stringify(this.state.listTitles));
    localStorage.setItem("currentList", JSON.stringify(this.state.currentList));

		return (
      <div className="container">
        <Sidebar listTitles={this.state.listTitles} onListCreate={this.handleListCreate} onListChange={this.handleListChange} />
        <div className="TodoList">
          <ListTitle>{lTitle}</ListTitle>
          <ItemList items={itemList} onClick={this.handleListClick}/>
          <SubmissionBox onSubmit={this.handleItemSubmit} />
        </div>
      </div>
		);
	}	
}

class ListTitle extends React.Component {
	render() {
		return (
			<div className="ListTitle">
				{this.props.children}
			</div>
		);
	}
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(itemBody) {
    this.props.onClick(itemBody);
  }

	render() {
		const todoItems = this.props.items.map((item) => <ListItem onClick={this.handleClick} itemDetail={item} />);
		return (
			<ul className="ItemList">
				{todoItems}
			</ul>
		);
	}
}

class ListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {done: false};

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.props.onClick(event.target.textContent);
  }

	render() {
		const color = this.props.itemDetail.color;
		const itemBody = this.props.itemDetail.body;
    const done = this.props.itemDetail.done ? 'done' : '';
		return (
			<li className={"ListItem " + done} onClick={this.handleClick} style={{ color: {color} }}>
				{itemBody}
			</li>
		);
	}
}

class SubmissionBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {value: ''};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.value !== '') {
      this.props.onSubmit(this.state.value);
      this.setState({value: ''});
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

	render() {
		return (
			<form className="SubmissionBox" onSubmit={this.handleSubmit}>
				<input type="text" onChange={this.handleChange} value={this.state.value} />
				<input type="submit" value="New Entry" />
			</form>
		);
	}
}

export default TodoList;
