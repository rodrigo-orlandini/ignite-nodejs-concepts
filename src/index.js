const express = require('express');
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find((user) => user.username === username);

	if(!user) {
		return response.status(400).send({ error: "User doesn't exists" });
	}

	request.username = username;

	return next();
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	const userAlreadyExists = users.some((user) => user.username === username);

	if(userAlreadyExists) {
		return response.status(400).send({ error: "Username already exists!" });
	}

	const user = {
		id: uuidV4(),
		name,
		username,
		todos: []
	};

	users.push(user);

	return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { username } = request;

	const user = users.find((user) => user.username === username);

	return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { username } = request;
	const { title, deadline } = request.body;

	const user = users.find((user) => user.username === username);

	const todo = {
		id: uuidV4(),
		title,
		deadline: new Date(deadline),
		done: false,
		created_at: new Date()
	}

	user.todos.push(todo);

	return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { username } = request;
	const { title, deadline } = request.body;
	const { id } = request.params;

	const user = users.find((user) => user.username === username);
	const todo = user.todos.find((todo) => todo.id === id);

	if(!todo) {
		return response.status(404).send({ error: "Todo not found" });
	}

	todo.title = title;
	todo.deadline = deadline;

	return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { username } = request;
	const { id } = request.params;

	const user = users.find((user) => user.username === username);
	const todo = user.todos.find((todo) => todo.id === id);

	if(!todo) {
		return response.status(404).send({ error: "Todo not found" });
	}

	todo.done = true;

	return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { username } = request;
	const { id } = request.params;

	const user = users.find((user) => user.username === username);
	const todo = user.todos.find((todo) => todo.id === id);

	if(!todo) {
		return response.status(404).send({ error: "Todo not found" });
	}

	user.todos.splice(todo, 1);

	return response.status(204).send();
});

module.exports = app;