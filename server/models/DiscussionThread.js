import { Schema, model } from 'mongoose';

const discussionThreadSchema = new Schema({
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  bookGoogleId: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  threadType: {
    type: String,
    enum: ['general', 'chapter', 'spoiler-free', 'spoiler', 'qa', 'book-selection'],
    default: 'general',
  },
  chapterRange: {
    type: String,
    default: null,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  replies: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  replyCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

discussionThreadSchema.index({ club: 1, book: 1, createdAt: -1 });

const DiscussionThread = model('DiscussionThread', discussionThreadSchema);

export default DiscussionThread;

