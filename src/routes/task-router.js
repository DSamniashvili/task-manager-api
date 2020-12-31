const express = require('express');
const Task = require('../models/task-model');
const taskRouter = new express.Router();
const auth = require('../middleware/auth');


taskRouter.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        "owner": req.user._id,
    })
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

taskRouter.get('/tasks', auth, async (req, res) => {

    let findOptionsObj = {
        'owner': req.user._id,
    }

    let sortOptionsObj = {}

    if (req.query.completed) {
        findOptionsObj = {
            ...findOptionsObj,
            completed: req.query.completed === 'true'
        }
    }

    //sortBy=createdAt:1

    if (req.query.sortBy) {
        const queryParamParts = req.query.sortBy.split(':');
        const key = queryParamParts[0];
        const value = queryParamParts[1];

        sortOptionsObj = {
            ...sortOptionsObj,
            [key]: value === 'desc' ? -1 : 1,
        }
    }


    try {
        await Task.find(findOptionsObj)
            .limit(parseInt(req.query.limit))
            .skip(parseInt(req.query.skip))
            .sort(sortOptionsObj)
            .populate({
                path: 'tasks'
            }).exec(function (err, tasks) {
                res.send(tasks);
            });
    } catch (err) {
        res.status(500).send(err)
    }
})


taskRouter.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({
            _id,
            'owner': req.user._id,
        })

        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (err) {
        res.status(400).send(err)
    }
})


taskRouter.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const requestedUpdates = Object.keys(req.body);
    const validUpdaes = ['describtion', 'completed'];
    const isValidUpdateRequest = requestedUpdates.every(update => validUpdaes.includes(update));

    if (!isValidUpdateRequest) {
        return res.status(400).send('Bad update request');
    }

    try {
        const task = await Task.findOne({ _id, 'owner': req.user._id })

        if (!task) {
            return res.status(404).send('Task not found');
        }

        requestedUpdates.forEach(update => task[update] = req.body[update]);
        await task.save();

        res.send(task);

    } catch (err) {
        res.status(400).send(err)
    }
})



taskRouter.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOneAndDelete({
            _id,
            'owner': req.user._id,
        });

        if (!task) {
            return res.status(404).send('Task not found');
        }

        res.send(task.describtion + ' deleted successfully');
    } catch (err) {
        res.status(400).send(err)
    }
})

module.exports = taskRouter;