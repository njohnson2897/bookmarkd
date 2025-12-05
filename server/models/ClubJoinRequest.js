import { Schema, model } from 'mongoose';

const clubJoinRequestSchema = new Schema({
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  message: {
    type: String,
    maxlength: 500,
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
});

// Index for efficient queries
clubJoinRequestSchema.index({ club: 1, status: 1, createdAt: -1 });
clubJoinRequestSchema.index({ user: 1, status: 1 });

// Prevent duplicate pending requests
clubJoinRequestSchema.index({ club: 1, user: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

const ClubJoinRequest = model('ClubJoinRequest', clubJoinRequestSchema);

export default ClubJoinRequest;

