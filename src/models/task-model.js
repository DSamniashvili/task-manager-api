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
    }
})

taskSchema.pre('save', async function (next) {

    next();
});

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;