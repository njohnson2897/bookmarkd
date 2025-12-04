import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['like', 'comment', 'follow', 'review'],
  },
  fromUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const Notification = model('Notification', notificationSchema);

export default Notification;

