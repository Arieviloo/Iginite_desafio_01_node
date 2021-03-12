const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find(otherUser => otherUser.username === username )
  if(!user) {
    return response.status(404).json({error: "user not found"})
  }

  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const verifyUserExists = users.some(user => user.username === username)
  if(verifyUserExists) {
    return response.status(400).json({error:"User already exists"})
  }

  const user ={
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {title, deadline} = request.body

  const todos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todos)

  return response.status(201).json(todos)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params
  const {title, deadline} = request.body

  const todoId = user.todos.find(todo => todo.id === id)
  if(!todoId) {
    return response.status(404).json({error: "todo not found"})
  }

  todoId.title = title
  todoId.deadline = new Date(deadline)

  return response.status(200).json(todoId)

  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
 const { user } = request
 const {id} = request.params

 const todoId = user.todos.find(todo => todo.id === id)
 if(!todoId) {
  return response.status(404).json({error: "todo not found"})
}

 todoId.done = true

 return response.status(200).json(todoId)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request
  const {id} = request.params

  const todoId = user.todos.find(todo => todo.id === id)
  if(!todoId) {
    return response.status(404).json({error: "todo not found"})
  }

  user.todos.splice(user.todos.indexOf(todoId), 1)

return response.status(204).send()
});

module.exports = app;