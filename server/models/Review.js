const { Schema, model } = require('mongoose');

const reviewSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    stars: {
        type: Number,
        require: true,
    }, 
    title: {
        type: String,
        require: false,
    },
    description: {
        type: String,
        require: false,
    }
})

const Review = model('Review', reviewSchema);

module.exports = Review;