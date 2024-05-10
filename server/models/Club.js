const { Schema, model } = require('mongoose');

const clubSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ]
})

const Club = model('Club', clubSchema);

module.exports = Club;