const { Schema } = require('mongoose');

const bookStatusSchema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
    },
    status: {
        type: String,
        required: true,
    },
    favorite: {
        type: String,
        required: true, 
    },
})

module.exports = bookStatusSchema;