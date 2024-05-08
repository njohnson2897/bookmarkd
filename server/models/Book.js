const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    google_id: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

const Book = model('Book', bookSchema);

module.exports = Book;
