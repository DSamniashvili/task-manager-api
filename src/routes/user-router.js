const express = require('express');
const User = require('../models/user-model');
const userRouter = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload only image files'))
        }
        cb(undefined, true)
    }
});


userRouter.post('/users/profile/upload', auth, upload.single('avatar'), async (req, res) => {
    const imageBuffer = req.file.buffer;
    const user = req.user;

    user.avatar = imageBuffer;
    await user.save();

    res.send();
}, (error, req, res, next) => {
    // upper declaration is needed for the middleware to properly handle thrown errors
    res.status(400).send(error.message);
})


userRouter.delete('/users/profile/avatar', auth, async (req, res) => {
    const user = req.user;

    try {
        if (!user.avatar) {
            return res.send('No avatar provided');
        }

        user.avatar = undefined;
        user.save()
        res.send('successfully deleted user avatar');

    } catch (err) {
        res.status(500).send(err)
    }
});



userRouter.get('/users/:id/avatar', async (req, res) => {
    const _id = req.params.id;
    const user = await User.findOne({ _id });

    try {
        if (!user || !user.avatar) {
            return res.send('No avatar provided');
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar);

    } catch (err) {
        res.status(500).send(err)
    }
});

userRouter.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.generateWebToken();

        await user.save()
        res.status(201).send({ user, token })

    } catch (e) {
        res.status(404).send(e)
    };
})


userRouter.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (err) {
        res.status(500).send(err)
    }
})



userRouter.get('/users/profile', auth, async (req, res) => {
    res.send(req.user);
})

userRouter.patch('/users/profile', auth, async (req, res) => {

    const requestedUpdates = Object.keys(req.body);
    const validUpdates = ['name', 'age', 'password'];

    const isValidUpdateRequest = requestedUpdates.every(update => validUpdates.includes(update));

    if (!isValidUpdateRequest) {
        return res.status(400).send('Bad update request');
    }

    try {
        const { user } = req;
        requestedUpdates.forEach(update => user[update] = req.body[update]);

        await user.save();
        res.send(user);

    } catch (err) {
        res.status(400).send(err)
    }
})


userRouter.delete('/users/profile', auth, async (req, res) => {

    try {
        await req.user.remove();
        console.log('users/profile delete', req.user);

        res.send('deleted');

    } catch (err) {
        res.status(500).send(err)
    }
});

userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findUserByCredentials(req.body.email, req.body.password);
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