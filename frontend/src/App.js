import React, { Component } from 'react';
import './App.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      todoList: [],
      activeItem: {
        id: null,
        title: '',
        completed: false
      },
      editing: false,
    };
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
  }

  componentDidMount() {
    this.fetchTasks()
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }


  fetchTasks() {
    fetch("http://192.168.0.103:8000/api/task-list/")
      .then(response => response.json())
      .then(
        data => this.setState({
          todoList: data
        })
      )
  }

  handleChange(e) {
    var value = e.target.value;
    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value
      }
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    // console.log(this.state.activeItem)
    var csrf_token = this.getCookie('csrftoken')

    var url = "http://192.168.0.103:8000/api/task-create/"

    if (this.state.editing) {
      url = `http://192.168.0.103:8000/api/task-update/${this.state.activeItem.id}/`
      this.setState({
        editing: false
      })
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-type": 'application/json',
        "X-CSRFToken": csrf_token
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem: {
          id: null,
          title: '',
          completed: false
        }
      })
    }).catch((error) => {
      console.log('Error', error)
    })
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    })
  }

  deleteItem(task) {
    var csrf_token = this.getCookie('csrftoken')
    fetch(`http://192.168.0.103:8000/api/task-delete/${task.id}/`, {
      method: 'DELETE',
      headers: {
        "Content-type": 'application/json',
        "X-CSRFToken": csrf_token,
      }
    }).then((response) => {
      this.fetchTasks()
    })
  }

  strikeUnstrike(task) {
    task.completed = !task.completed
    console.log(task)
    var csrf_token = this.getCookie('csrftoken')
    var url = `http://192.168.0.103:8000/api/task-update/${task.id}/`
    fetch(url, {
      method: 'POST',
      headers: {
        "Content-type": 'application/json',
        "X-CSRFToken": csrf_token,
      },
      body: JSON.stringify(task)
    }).then((response) => {
        this.fetchTasks()
      })
  }

  render() {

    var tasks = this.state.todoList;

    return (
      <div className="container">
        <div id="task-container">
          <div id='form-wrapper'>
            <form onSubmit={this.handleSubmit} id="form">
              <div className="flex-wrapper">

                <div style={{ flex: 6 }}>
                  <input onChange={this.handleChange} className="form-control" id="title" type="text" name="title" value={this.state.activeItem.title} placeholder="Add task.." />
                </div>

                <div style={{ flex: 1 }}>
                  <input id="submit" className="btn btn-warning" type="submit" name="Add" />
                </div>

              </div>
            </form>
          </div>

          <div id='list-wrapper'>
            {tasks.map(
              (task, index) =>
                <div key={index} className="task-wrapper flex-wrapper">

                  <div onClick={() => this.strikeUnstrike(task)} style={{ flex: 7 }}>
                    {task.completed === false ? (<span>{task.title}</span>) : (<strike>{task.title}</strike>)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => this.startEdit(task)} className="btn btn-sm btn-outline-info">Edit</button>
                  </div>

                  <div style={{ flex: 1 }}>
                    <button onClick={() => this.deleteItem(task)} className="btn btn-sm btn-outline-dark delete">-</button>
                  </div>

                </div>
            )}
          </div>

        </div>

      </div>
    );
  }
}

export default App;
