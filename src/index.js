const express = require('express');
const mongoose = require('mongoose');
require('./db/mongoose');
const User = require('./models/user-model');
const Task = require('./models/task-model');
const userRouter = require('./routes/user-router');
const taskRouter = require('./routes/task-router');

const app = express();

const port = process.env.PORT;

// automatically parses incoming JSON to an object
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);


app.listen(port, () => {
    console.log('Listening to port: ', + port);
})