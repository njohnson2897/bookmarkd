const { Schema, model } = require('mongoose');
const bookStatusSchema = require('./BookStatus');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+@.+\..+/, 'Must match an email address!']
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    books: [
        bookStatusSchema
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
    clubs: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Club'
        },
    ]

});

const User  =  model('User', userSchema);

module.exports = User;