const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    describtion: {
        type: String,
        required: true,
        minlength: 2,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }
}, {
    timestamps: true,
})

taskSchema.pre('save', async function (next) {

    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;