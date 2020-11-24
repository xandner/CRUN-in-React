import logo from './logo.svg';
import React from 'react'
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            todoList: [],
            activeItem: {
                id: null,
                title: '',
                completed: false,
            },
            editing: false,
        }
        this.fetchTasks = this.fetchTasks.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.getCookies = this.getCookies.bind(this)
        this.deleteItem = this.deleteItem.bind(this)
    };

    getCookies(name) {
        var cookieValue = null
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break
                }
            }
        }
        return cookieValue;

    }

    componentWillMount() {
        this.fetchTasks()
    }

    fetchTasks() {
        console.log('Fetch')
        fetch('http://localhost:8000/api/task-list/').then(
            response => response.json().then(
                data => this.setState({
                    todoList: data
                })
            )
        )
    }

    handleChange(e) {
        var name = e.target.name
        var value = e.target.value
        console.log('name', name)
        console.log('value', value)
        this.setState({
            activeItem: {
                ...this.state.activeItem,
                title: value
            }
        })
    }

    handleSubmit(e) {
        e.preventDefault()
        console.log('Item:', this.state.activeItem)
        var csrftoken = this.getCookies('csrftoken')
        var url = 'http://localhost:8000/api/task-create/'
        if (this.state.editing === true) {
            url = 'http://localhost:8000/api/task-update/' + this.state.activeItem.id + '/'
            this.setState({
                editing: false
            })

        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(this.state.activeItem)
        }).then((response) => {
            this.fetchTasks()
            this.setState({

                activeItem: {
                    id: null,
                    title: '',
                    completed: false,
                },
            })
        }).catch(function (error) {
            console.log("ERROR", error)
        })
    }

    startEdit(task) {
        this.setState({
            activeItem: task,
            editing: true,
            completed: true,
        })
    }

    deleteItem(task) {
        var csrftoken = this.getCookies('csrftoken')
        var url = "http://localhost:8000/api/task-delete/" + task.id + '/'
        fetch(url, {
            'method': 'DELETE',
            'headers': {
                'Content-type': 'application/Json',
                'X-CSRFToken': csrftoken
            }
        }).then((response) => {
            this.fetchTasks()
        })
    }


    render() {
        var tasks = this.state.todoList
        var self = this
        return (

            <div className='container'>
                <div id="task-container">
                    <div id="form-wrapper">
                        <form onSubmit={this.handleSubmit} className="form">
                            <div className="flex-wrapper">
                                <div style={{flex: 6}}>
                                    <input onChange={this.handleChange} value={this.state.activeItem.title} type="text"
                                           id="title" name="title" className="form-control"/>
                                </div>
                                <div style={{flex: 1}}>
                                    <input type="submit" id="submit" className="btn btn-warning"/>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="list-wrapper">
                        {tasks.map(function (task, index) {
                            return (
                                <div key={index} className="task-wrapper flex-wrapper">
                                    <div style={{flex: 7}}>
                                        {task.completed === false ? (
                                            <span>{task.title}</span>
                                        ) :( <strike>{task.title}</strike>)}
                                    </div>
                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.startEdit(task)}
                                                className="btn btn-sm btn-outline-info">edit
                                        </button>
                                    </div>
                                    <div style={{flex: 1}}>
                                        <button onClick={() => self.deleteItem(task)}
                                                className="btn btn-sm btn-outline-dark delete">delete
                                        </button>
                                    </div>

                                </div>
                            )
                        })}

                    </div>
                </div>
            </div>
        )
    }
}

export default App;
