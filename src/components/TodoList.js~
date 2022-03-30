import React from 'react';
import Sidebar from './Sidebar';
import { v4 as uuidv4 } from 'uuid';

class TodoList extends React.Component {
  constructor(props) {
    super(props);
    const itemLists = JSON.parse(localStorage.getItem("itemLists"));
    const listTitles = JSON.parse(localStorage.getItem("listTitles"));
    const currentList = JSON.parse(localStorage.getItem("currentList"));
    const darkmode = JSON.parse(localStorage.getItem("darkmode"));
    const newListTitleId = uuidv4();
    this.state = {
      itemLists: (itemLists || []), 
      listTitles: (listTitles || []), 
      currentList: (currentList || 0),
      darkmode: (darkmode || false)
    };
    this.handleItemSubmit = this.handleItemSubmit.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleListCreate = this.handleListCreate.bind(this);
    this.handleListClick = this.handleListClick.bind(this);
    this.handleListDelete = this.handleListDelete.bind(this);
    this.handleListTitleEdit = this.handleListTitleEdit.bind(this);
    this.handleItemDelete = this.handleItemDelete.bind(this);
    this.handleDarkmodeToggle = this.handleDarkmodeToggle.bind(this);
  }
 
  // List deletion added, but must implement a check for when the last list is deleted
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
          ...prevState.itemLists.splice(0, prevState.currentList),
          aList,
          ...prevState.itemLists.splice(prevState.currentList + 1)
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
      };
    });
  }

  handleItemDelete(itemId) {
    this.setState(function(prevState, props) {
      const index = this.getListItemIndex(prevState, itemId);
      const iList = [
        ...prevState.itemLists[prevState.currentList].slice(0, index), 
        ...prevState.itemLists[prevState.currentList].slice(index  + 1)
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

	render() {
    // Use effect might be better for this use case, but the performance difference seems negligible
    localStorage.setItem("itemLists", JSON.stringify(this.state.itemLists));
    localStorage.setItem("listTitles", JSON.stringify(this.state.listTitles));
    localStorage.setItem("currentList", JSON.stringify(this.state.currentList));
    localStorage.setItem("darkmode", JSON.stringify(this.state.darkmode));

    const dMode = (this.state.darkmode) ? 'dark' : 'light';
    var conditionalRenderItem;
    if (this.state.itemLists.length >= 1) {
      const itemList = this.state.itemLists[this.state.currentList]; 
      const lTitle = this.state.listTitles[this.state.currentList].title;
      conditionalRenderItem = ( 
        <div className={"TodoList " + dMode}>
          <ListTitle viewmode={dMode} onToggle={this.handleDarkmodeToggle} onClick={this.handleListDelete} onChange={this.handleListTitleEdit} value={lTitle} />
          <ItemList items={itemList} onDelete={this.handleItemDelete} onClick={this.handleListClick}/>
          <SubmissionBox viewmode={dMode} onSubmit={this.handleItemSubmit} />
        </div>
      );
    } else {
      const text = "<-- Click the plus icon to create a new list!";
      conditionalRenderItem = (
        <div className={"help-container " + dMode}>
          <p className="help-text">{text}</p>
        </div>
      );
    }

		return (
      <div className="container">
        <Sidebar listTitles={this.state.listTitles} currentList={this.state.currentList} onListCreate={this.handleListCreate} onListChange={this.handleListChange} />
        {conditionalRenderItem}
      </div>
		);
	}	
}

class ListTitle extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event.target.value);
  }

	render() {
		return (
			<div className={"ListTitle " + this.props.viewmode}>
        <input type="text" value={this.props.value} onChange={this.handleChange} />
        <div className="ui-button-container">
          <div className={"ui-button view-mode-toggle noselect " + this.props.viewmode} onClick={this.props.onToggle}>
            M
          </div>
          <div className="ui-button listDelete noselect" onClick={this.props.onClick}>
            X
          </div>
        </div>
			</div>
		);
	}
}

class ItemList extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick(itemId) {
    this.props.onClick(itemId);
  }

	render() {
		const todoItems = this.props.items.map((item) => {
      return <ListItem key={item.id} id={item.id} onClick={this.handleClick} onDelete={this.props.onDelete} itemDetail={item} />;
    });
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
    this.handleItemDelete = this.handleItemDelete.bind(this);
  }

  handleClick(event) {
    if (event.target.type !== "submit") this.props.onClick(event.target.id);
  }

  handleItemDelete(event) {
    event.preventDefault();
    this.props.onDelete(event.target.id);
  }
  
	render() {
		const color = this.props.itemDetail.color;
		const itemBody = this.props.itemDetail.body;
    const done = this.props.itemDetail.done ? 'done' : '';
		return (
			<li className="ListItem" onClick={this.handleClick} id={this.props.id} style={{ color: {color} }}>
        <div className={done} id={this.props.id}>
          {itemBody}
        </div>

        <button className="listDeleteButton" id={this.props.id} onClick={this.handleItemDelete}>X</button>
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
			<form className={"SubmissionBox " + this.props.viewmode} onSubmit={this.handleSubmit}>
				<input type="text" onChange={this.handleChange} value={this.state.value} />
				<input type="submit" value="New Entry" />
			</form>
		);
	}
}

export default TodoList;
