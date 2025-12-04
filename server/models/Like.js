import { Schema, model } from 'mongoose';

const likeSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  review: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only like a review once
likeSchema.index({ user: 1, review: 1 }, { unique: true });

const Like = model('Like', likeSchema);

export default Like;

