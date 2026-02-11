import { Schema, model } from 'mongoose';

const clubSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  moderators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  currentBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    default: null,
  },
  currentBookGoogleId: {
    type: String,
    default: null,
  },
  currentBookStartDate: {
    type: Date,
    default: null,
  },
  nextBook: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    default: null,
  },
  nextBookGoogleId: {
    type: String,
    default: null,
  },
  readingCheckpoints: [
    {
      title: String,
      date: Date,
      chapters: String,
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  privacy: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public',
  },
  memberLimit: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Club = model('Club', clubSchema);

export default Club;



