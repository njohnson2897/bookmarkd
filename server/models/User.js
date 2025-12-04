import { Schema, model } from 'mongoose';
import bookStatusSchema from './BookStatus.js';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
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
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  favAuthor: {
    type: String,
  },
  favBook: {
    type: String
  },
  books: [bookStatusSchema],
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

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model('User', userSchema);

export default User;


