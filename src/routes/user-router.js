const express = require('express');
const UserModel = require('../models/user-model');
const userRouter = new express.Router();
const auth = require('../middleware/auth');

userRouter.post('/users', async (req, res) => {
    try {
        const user = new UserModel(req.body);
        const token = await user.generateWebToken();

        await user.save()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(404).send(e)
    };

    // user.save()
    //     .then((resonse) => res.status(201).send(user))
    //     .catch(err => res.status(404).send(err));

})


userRouter.get('/users', async (req, res) => {
    try {
        const users = await UserModel.find({})
        res.send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})



userRouter.get('/users/profile', auth, async (req, res) => {
    res.send(req.user);
})

userRouter.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await UserModel.findById(_id);
        if (!user) {
            return res.status(404).send('User not found.');
        }
        res.send(user);

    } catch (err) {
        res.status(400).send(err)
    }

    // User.findById(_id)
    //     .then((user) => {
    //         if (!user) {
    //             return res.status(404).send();
    //         }
    //         res.send(user);
    //     })
    //     .catch((err) => {
    //         res.status(500).send(err)
    //     })
})



userRouter.patch('/users/:id', async (req, res) => {
    const _id = req.params.id;

    const requestedUpdates = Object.keys(req.body);
    const validUpdates = ['name', 'age', 'password'];

    const isValidUpdateRequest = requestedUpdates.every(update => validUpdates.includes(update));

    if (!isValidUpdateRequest) {
        return res.status(400).send('Bad update request');
    }

    try {
        const user = await UserModel.findById(_id);
        requestedUpdates.forEach(update => user[update] = req.body[update]);
        await user.save();

        if (!user) {
            return res.status(404).send('User to update not found.');
        }
        res.send(user);

    } catch (err) {
        res.status(400).send(err)
    }
})


userRouter.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await UserModel.findByIdAndDelete(_id);
        if (!user) {
            return res.status(404).send('User not found.');
        }

        res.send(user);

    } catch (err) {
        res.status(400).send(err)
    }
});

userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await UserModel.findUserByCredentials(req.body.email, req.body.password);
        const token = await user.generateWebToken();
        res.send({ user, token });

    } catch (e) {
        return res.status(400).send('User authentication failed.');
    }
})

userRouter.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });

        res.send();
        await req.user.save();

    } catch (error) {
        return res.status(400).send('Could not logout.');
    }
})

userRouter.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.status(200).send('Logged out of all devices');
        await req.user.save();

    } catch (error) {
        return res.status(500).send('Could not logout from all devices.');
    }
})





module.exports = userRouter;