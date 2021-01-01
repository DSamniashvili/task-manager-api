const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('./task-model');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate(val) {
            if (val.length < 2) {
                throw new Error('Name must be at least 2 chars long');
            }
        }
    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be at least 1');
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new Error('Not a valid email');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(val) {
            if (val.toLowerCase().includes('password')) {
                throw new Error('Password must not include text "password".');
            }
        },
        minlength: 3,
        trim: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true,
})

userSchema.virtual('tasks', {
    ref: 'User',
    localField: '_id',
    foreignField: 'owner',
});

userSchema.methods.generateWebToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'deasamniashvili');

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject
}


userSchema.statics.findUserByCredentials = async (email, providedPassword) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found!');
    }

    const match = await bcrypt.compare(providedPassword, user.password);

    if (!match) {
        throw new Error('Password is incorrect!');
    }

    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
})

userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next()
})

const User = mongoose.model('User', userSchema);

module.exports = User;