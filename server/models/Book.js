import { Schema, model } from 'mongoose';

const bookSchema = new Schema({
  google_id: {
    type: String,
    required: true,
    unique: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});

const Book = model('Book', bookSchema);

export default Book;



