const { Schema, model } = require('mongoose');

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
        booksStatus
        // {
        //     book: {
        //         type: Schema.Types.ObjectId,
        //         ref: 'Book',
        //     },
        //     status: {
        //         type: String,
        //         required: true,
        //     },
        //     favorite: {
        //         type: String,
        //         required: true, 
        //     },
        // },
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