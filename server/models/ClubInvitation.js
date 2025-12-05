import { Schema, model } from 'mongoose';

const clubInvitationSchema = new Schema({
  club: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  inviter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitee: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
});

// Index for efficient queries
clubInvitationSchema.index({ invitee: 1, status: 1, createdAt: -1 });
clubInvitationSchema.index({ club: 1, status: 1 });

const ClubInvitation = model('ClubInvitation', clubInvitationSchema);

export default ClubInvitation;

