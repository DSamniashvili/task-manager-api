const express = require('express');
const Task = require('../models/task-model');
const taskRouter = new express.Router();


taskRouter.post('/tasks', async (req, res) => {
    const task = new Task(req.body);
    try {
        await task.save()
        res.status(201).send(task);

    } catch (err) {
        res.status(404).send(err);
    }
})

// taskRouter.post('/tasks', (req, res) => {
//     const task = new Task(req.body);

//     task.save()
//         .then((resonse) => res.status(201).send(task))
//         .catch(err => res.status(404).send(err));

// })

taskRouter.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.send(tasks)

    } catch (err) {
        res.status(500).send(err)
    }

    // Task.find({})
    //     .then(tasks => res.send(tasks))
    //     .catch(err => res.status(500).send(err))
})


taskRouter.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err)
    }

    // Task.findById(_id)
    //     .then((task) => {
    //         if (!task) {
    //             return res.status(404).send();
    //         }
    //         res.send(task);
    //     })
    //     .catch((err) => {
    //         res.status(500).send(err)
    //     })
})

taskRouter.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    const requestedUpdates = Object.keys(req.body);
    const validUpdaes = ['describtion', 'completed'];

    const isValidUpdateRequest = requestedUpdates.every(update => validUpdaes.includes(update));

    if (!isValidUpdateRequest) {
        return res.status(400).send('Bad update request');
    }

    console.log('isValidUpdateRequest', req.body)

    try {

        const task = await Task.findById(_id);
        requestedUpdates.forEach(update => task[update] = req.body[update]);
        await task.save();

        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err)
    }
})



taskRouter.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findByIdAndDelete(_id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = taskRouter;