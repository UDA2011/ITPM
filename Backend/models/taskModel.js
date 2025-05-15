const mongoose = require("mongoose");
const mongooseSequence = require('mongoose-sequence');

const AutoIncrement = mongooseSequence(mongoose);

const taskSchema = new mongoose.Schema({
    taskNo: {
        type: Number,
        unique: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    dueDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Due date must be in the future'
        }
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        required: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        enum: ['Stock counting', 'Packaging and labeling', 'Sample collection for testing', 'Facility checks', 'Data entry', 'Training attendance','Orders'],
        default: 'Stock counting'
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function(tags) {
                return tags.length <= 5; // Limit number of tags
            },
            message: 'Cannot have more than 5 tags'
        }
    },
    reminder: Date,

    /*
    assignedEmployee: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EmployeeModel',
        validate: {
            validator: async function(value) {
                const employee = await mongoose.model('EmployeeModel').findById(value);
                return employee !== null;
            },
            message: 'Employee does not exist'
        }
    }
    */
});

taskSchema.plugin(AutoIncrement, { inc_field: 'taskNo' });

module.exports = mongoose.model("Task", taskSchema);