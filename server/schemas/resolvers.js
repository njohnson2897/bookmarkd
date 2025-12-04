import { User, Book, Club, Review, Contact, Like, Comment, Follow, Notification } from '../models/index.js';
import { AuthenticationError, AuthorizationError, signToken, requireAuth, requireAuthAndMatch, requireAuthAndMatchOptional } from '../utils/auth.js';

const resolvers = {
  Query: {
    users: async () => {
      const users = await User.find().populate([
        'books.book',
        {
          path: 'reviews',
          populate: {
            path: 'book',
            select: '_id google_id'
          }
        },
        {
          path: 'clubs',
          populate: {
            path: 'owner',
            select: '_id username'
          }
        }
      ]);
      
      // Filter out reviews with invalid books and clubs with invalid owners for each user
      users.forEach(user => {
        if (user.reviews) {
          user.reviews = user.reviews.filter(review => review.book && review.book.google_id);
        }
        if (user.clubs) {
          user.clubs = user.clubs.filter(club => club.owner && club.owner.username);
        }
      });
      
      return users;
    },
    user: async (parent, { id }) => {
      const user = await User.findOne({ _id: id }).populate([
        'books.book',
        {
          path: 'reviews',
          populate: {
            path: 'book',
            select: '_id google_id'
          }
        },
        {
          path: 'clubs',
          populate: {
            path: 'owner',
            select: '_id username'
          }
        }
      ]);
      
      // Filter out reviews with invalid books and clubs with invalid owners
      if (user) {
        if (user.reviews) {
          user.reviews = user.reviews.filter(review => review.book && review.book.google_id);
        }
        if (user.clubs) {
          user.clubs = user.clubs.filter(club => club.owner && club.owner.username);
        }
      }
      
      return user;
    },
    books: async () => {
      const books = await Book.find().populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'username _id'
        }
      });
      // Filter out reviews with invalid users
      books.forEach(book => {
        if (book.reviews) {
          book.reviews = book.reviews.filter(review => review.user && review.user.username);
        }
      });
      return books;
    },
    book: async (parent, { id }) => {
      const book = await Book.findOne({ _id: id }).populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'username _id'
        }
      });
      // Filter out reviews with invalid users
      if (book && book.reviews) {
        book.reviews = book.reviews.filter(review => review.user && review.user.username);
      }
      return book;
    },
    bookGoogle: async (parent, { googleId }) => {
      const book = await Book.findOne({ google_id: googleId }).populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'username _id'
        }
      });
      // Filter out reviews with invalid users
      if (book && book.reviews) {
        book.reviews = book.reviews.filter(review => review.user && review.user.username);
      }
      return book;
    },
    reviews: async () => {
      return Review.find().populate(['book', 'user']);
    },
    review: async (parent, { id }) => {
      return Review.findOne({ _id: id }).populate(['book', 'user']);
    },
    clubs: async () => {
      return Club.find().populate(['owner', 'members']);
    },
    club: async (parent, { id }) => {
      return Club.findOne({ _id: id }).populate(['owner', 'members']);
    },
    activityFeed: async (parent, { userId }, context) => {
      // User must be authenticated to see activity feed
      requireAuth(context);
      
      // Get users that the current user is following
      const follows = await Follow.find({ follower: userId }).select('following');
      const followingIds = follows.map(f => f.following);
      
      // Include the user themselves in the feed
      followingIds.push(userId);
      
      // Get recent reviews from followed users
      const recentReviews = await Review.find({ user: { $in: followingIds } })
        .populate([
          {
            path: 'book',
            select: '_id google_id'
          },
          {
            path: 'user',
            select: '_id username'
          }
        ])
        .sort({ createdAt: -1 })
        .limit(50);
      
      // Get recent club activities (users joining clubs)
      const recentClubs = await Club.find({ 
        $or: [
          { owner: { $in: followingIds } },
          { members: { $in: followingIds } }
        ]
      })
        .populate(['owner', 'members'])
        .sort({ createdAt: -1 })
        .limit(20);
      
      // Format as activity items
      const activities = [];
      
      // Add review activities
      recentReviews.forEach(review => {
        activities.push({
          _id: `review_${review._id}`,
          type: 'review',
          user: review.user,
          review: review,
          book: review.book,
          createdAt: review.createdAt || new Date(),
        });
      });
      
      // Sort all activities by date
      activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return activities.slice(0, 30); // Return top 30 most recent
    },
    notifications: async (parent, { userId }, context) => {
      // User must be authenticated and can only see their own notifications
      requireAuth(context);
      if (context.user._id.toString() !== userId.toString()) {
        throw AuthorizationError;
      }
      
      const notifications = await Notification.find({ user: userId })
        .populate('fromUser', '_id username')
        .populate({
          path: 'review',
          populate: {
            path: 'book',
            select: '_id google_id'
          }
        })
        .populate('comment')
        .sort({ createdAt: -1 })
        .limit(50);
      
      return notifications;
    },
    unreadNotificationCount: async (parent, { userId }, context) => {
      // User must be authenticated and can only see their own notification count
      requireAuth(context);
      if (context.user._id.toString() !== userId.toString()) {
        throw AuthorizationError;
      }
      
      return Notification.countDocuments({ user: userId, read: false });
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      try {
        const user = await User.create({ username, email, password });
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        if (error.code === 11000) {
          // Duplicate key error
          const field = Object.keys(error.keyPattern)[0];
          throw new Error(`${field === 'email' ? 'Email' : 'Username'} already exists`);
        }
        throw error;
      }
    },
    addBook: async (parent, { google_id }) => {
      // Check if book already exists
      const existingBook = await Book.findOne({ google_id });
      if (existingBook) {
        return existingBook;
      }
      return Book.create({ google_id });
    },
    addBookStatus: async (parent, { book, user, status, favorite }, context) => {
      // User must be authenticated and can only add books to their own collection
      requireAuthAndMatch(context, user);
      
      return User.findOneAndUpdate(
        { _id: user },
        { $addToSet: { books: { book, status, favorite } } },
        { new: true }
      ).populate('books.book');
    },
    addReview: async (parent, { book, user, stars, title, description }, context) => {
      // User must be authenticated and can only add reviews as themselves
      requireAuthAndMatch(context, user);
      
      const review = await Review.create({ book, user, stars, title, description });
      await User.findOneAndUpdate(
        { _id: user },
        { $addToSet: { reviews: review._id } }
      );
      await Book.findOneAndUpdate(
        { _id: book },
        { $addToSet: { reviews: review._id } }
      );
      return Review.findById(review._id).populate(['book', 'user']);
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    addClub: async (parent, { name, owner }, context) => {
      // User must be authenticated and can only create clubs as themselves
      requireAuthAndMatch(context, owner);
      
      const club = await Club.create({ name, owner });
      await User.findOneAndUpdate(
        { _id: owner },
        { $addToSet: { clubs: club._id } }
      );
      return Club.findById(club._id).populate(['owner', 'members']);
    },
    addClubMember: async (parent, { clubId, userId }, context) => {
      // User must be authenticated and can only join clubs as themselves
      requireAuthAndMatch(context, userId);
      
      // Check if user is already a member
      const club = await Club.findById(clubId);
      if (!club) {
        throw new Error('Club not found');
      }
      
      // Don't add if already a member or if they're the owner
      if (club.members.includes(userId) || club.owner.toString() === userId) {
        return Club.findById(clubId).populate(['owner', 'members']);
      }
      
      // Add user to club members
      await Club.findByIdAndUpdate(
        clubId,
        { $addToSet: { members: userId } }
      );
      
      // Add club to user's clubs array
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { clubs: clubId } }
      );
      
      return Club.findById(clubId).populate(['owner', 'members']);
    },
    removeClubMember: async (parent, { clubId, userId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const club = await Club.findById(clubId);
      if (!club) {
        throw new Error('Club not found');
      }
      
      const currentUser = context.user;
      
      // User can only remove themselves, OR owner can remove any member
      if (currentUser._id.toString() !== userId.toString() && 
          currentUser._id.toString() !== club.owner.toString()) {
        throw AuthorizationError;
      }
      
      // Can't remove the owner
      if (club.owner.toString() === userId) {
        throw new Error('Cannot remove club owner');
      }
      
      // Remove user from club members
      await Club.findByIdAndUpdate(
        clubId,
        { $pull: { members: userId } }
      );
      
      // Remove club from user's clubs array
      await User.findByIdAndUpdate(
        userId,
        { $pull: { clubs: clubId } }
      );
      
      return Club.findById(clubId).populate(['owner', 'members']);
    },
    updateReview: async (parent, { reviewId, stars, title, description }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const reviewData = await Review.findOne({ _id: reviewId });
      if (!reviewData) {
        throw new Error('Review not found');
      }
      
      // Only the review owner can update their review
      requireAuthAndMatch(context, reviewData.user);
      
      const updateData = {};
      if (stars !== undefined && stars !== null) updateData.stars = stars;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      
      const updatedReview = await Review.findOneAndUpdate(
        { _id: reviewId },
        updateData,
        { new: true }
      ).populate(['book', 'user']);
      
      return updatedReview;
    },
    deleteReview: async (parent, { reviewId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const reviewData = await Review.findOne({ _id: reviewId }).populate('book');
      if (!reviewData) {
        throw new Error('Review not found');
      }
      
      // Only the review owner can delete their review
      requireAuthAndMatch(context, reviewData.user);
      
      // Get book ID (handle both populated and ObjectId cases)
      const bookId = reviewData.book?._id || reviewData.book;
      const bookGoogleId = reviewData.book?.google_id || null;
      
      // Store the review data before deletion for return
      const reviewToReturn = {
        _id: reviewData._id,
        book: {
          _id: bookId,
          google_id: bookGoogleId,
        },
      };
      
      // Remove review from book
      await Book.findOneAndUpdate(
        { _id: bookId },
        { $pull: { reviews: reviewId } },
        { new: true }
      );
      
      // Remove review from user
      await User.findOneAndUpdate(
        { _id: reviewData.user },
        { $pull: { reviews: reviewId } },
        { new: true }
      );
      
      // Delete the review
      await Review.findOneAndDelete({ _id: reviewId });
      
      return reviewToReturn;
    },
    deleteClub: async (parent, { clubId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const clubData = await Club.findOne({ _id: clubId });
      if (!clubData) {
        throw new Error('Club not found');
      }

      // Only the club owner can delete the club
      requireAuthAndMatch(context, clubData.owner);

      // Remove club from owner
      await User.findOneAndUpdate(
        { _id: clubData.owner },
        { $pull: { clubs: clubId } }
      );

      // Remove club from all members
      if (clubData.members && clubData.members.length > 0) {
        await User.updateMany(
          { _id: { $in: clubData.members } },
          { $pull: { clubs: clubId } }
        );
      }

      return Club.findOneAndDelete({ _id: clubId });
    },
    removeUserBook: async (parent, { bookId, userId }, context) => {
      // User must be authenticated and can only remove books from their own collection
      requireAuthAndMatch(context, userId);
      
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { books: { book: bookId } } },
        { new: true }
      ).populate('books.book');
    },
    editUserBookStatus: async (parent, { bookId, userId, status }, context) => {
      // User must be authenticated and can only edit their own book status
      requireAuthAndMatch(context, userId);
      
      return User.findOneAndUpdate(
        { _id: userId, 'books.book': bookId },
        { $set: { 'books.$.status': status } },
        { new: true }
      ).populate('books.book');
    },
    editUserBookFavorite: async (parent, { bookId, userId, favorite }, context) => {
      // User must be authenticated and can only edit their own book favorites
      requireAuthAndMatch(context, userId);
      
      return User.findOneAndUpdate(
        { _id: userId, 'books.book': bookId },
        { $set: { 'books.$.favorite': favorite } },
        { new: true }
      ).populate('books.book');
    },
    updateUser: async (parent, { id, bio, location, favBook, favAuthor }, context) => {
      // User must be authenticated and can only update their own profile
      requireAuthAndMatch(context, id);
      
      const updateData = {};
      if (bio !== undefined) updateData.bio = bio;
      if (location !== undefined) updateData.location = location;
      if (favBook !== undefined) updateData.favBook = favBook;
      if (favAuthor !== undefined) updateData.favAuthor = favAuthor;

      return User.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true }
      ).populate(['books.book', 'reviews', 'clubs']);
    },
    submitContact: async (parent, { name, email, message }) => {
      // Contact form submissions don't require authentication
      const contact = await Contact.create({ name, email, message });
      return contact;
    },
    likeReview: async (parent, { reviewId, userId }, context) => {
      // User must be authenticated and can only like as themselves
      requireAuthAndMatch(context, userId);
      
      // Check if like already exists
      const existingLike = await Like.findOne({ user: userId, review: reviewId });
      if (existingLike) {
        // Already liked, return the review
        return Review.findById(reviewId).populate(['book', 'user']);
      }
      
      // Create the like
      await Like.create({ user: userId, review: reviewId });
      
      // Create notification for review owner (if not liking own review)
      const review = await Review.findById(reviewId).populate('user');
      if (review && review.user._id.toString() !== userId.toString()) {
        await Notification.create({
          user: review.user._id,
          type: 'like',
          fromUser: userId,
          review: reviewId,
        });
      }
      
      return Review.findById(reviewId).populate(['book', 'user']);
    },
    unlikeReview: async (parent, { reviewId, userId }, context) => {
      // User must be authenticated and can only unlike as themselves
      requireAuthAndMatch(context, userId);
      
      // Remove the like
      await Like.findOneAndDelete({ user: userId, review: reviewId });
      
      return Review.findById(reviewId).populate(['book', 'user']);
    },
    addComment: async (parent, { reviewId, userId, text }, context) => {
      // User must be authenticated and can only comment as themselves
      requireAuthAndMatch(context, userId);
      
      const comment = await Comment.create({ user: userId, review: reviewId, text });
      
      // Create notification for review owner (if not commenting on own review)
      const review = await Review.findById(reviewId).populate('user');
      if (review && review.user._id.toString() !== userId.toString()) {
        await Notification.create({
          user: review.user._id,
          type: 'comment',
          fromUser: userId,
          review: reviewId,
          comment: comment._id,
        });
      }
      
      return Comment.findById(comment._id).populate(['user', 'review']);
    },
    deleteComment: async (parent, { commentId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      
      // Only the comment owner can delete their comment
      requireAuthAndMatch(context, comment.user);
      
      return Comment.findOneAndDelete({ _id: commentId });
    },
    followUser: async (parent, { followerId, followingId }, context) => {
      // User must be authenticated and can only follow as themselves
      requireAuthAndMatch(context, followerId);
      
      // Can't follow yourself
      if (followerId.toString() === followingId.toString()) {
        throw new Error('Cannot follow yourself');
      }
      
      // Check if already following
      const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
      if (existingFollow) {
        return User.findById(followingId).populate(['books.book', 'reviews', 'clubs']);
      }
      
      // Create the follow relationship
      await Follow.create({ follower: followerId, following: followingId });
      
      // Create notification for the user being followed
      await Notification.create({
        user: followingId,
        type: 'follow',
        fromUser: followerId,
      });
      
      return User.findById(followingId).populate(['books.book', 'reviews', 'clubs']);
    },
    unfollowUser: async (parent, { followerId, followingId }, context) => {
      // User must be authenticated and can only unfollow as themselves
      requireAuthAndMatch(context, followerId);
      
      // Remove the follow relationship
      await Follow.findOneAndDelete({ follower: followerId, following: followingId });
      
      return User.findById(followingId).populate(['books.book', 'reviews', 'clubs']);
    },
    markNotificationAsRead: async (parent, { notificationId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Only the notification owner can mark it as read
      if (context.user._id.toString() !== notification.user.toString()) {
        throw AuthorizationError;
      }
      
      return Notification.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
      ).populate('fromUser', '_id username');
    },
    markAllNotificationsAsRead: async (parent, { userId }, context) => {
      // User must be authenticated and can only mark their own notifications as read
      requireAuthAndMatch(context, userId);
      
      await Notification.updateMany(
        { user: userId, read: false },
        { read: true }
      );
      
      return true;
    },
    deleteNotification: async (parent, { notificationId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      // Only the notification owner can delete it
      if (context.user._id.toString() !== notification.user.toString()) {
        throw AuthorizationError;
      }
      
      return Notification.findOneAndDelete({ _id: notificationId });
    },
  },
  
  // Field resolvers for Review
  Review: {
    likes: async (parent, args, context) => {
      const likes = await Like.find({ review: parent._id }).populate('user');
      return likes;
    },
    comments: async (parent, args, context) => {
      const comments = await Comment.find({ review: parent._id })
        .populate('user')
        .sort({ createdAt: -1 });
      return comments;
    },
    likeCount: async (parent, args, context) => {
      return Like.countDocuments({ review: parent._id });
    },
    commentCount: async (parent, args, context) => {
      return Comment.countDocuments({ review: parent._id });
    },
    isLiked: async (parent, args, context) => {
      if (!context || !context.user || !context.user._id) {
        return false;
      }
      const like = await Like.findOne({ review: parent._id, user: context.user._id });
      return !!like;
    },
    createdAt: (parent) => {
      return parent.createdAt ? parent.createdAt.toISOString() : null;
    },
  },
  
  // Field resolvers for User
  User: {
    followers: async (parent, args, context) => {
      const follows = await Follow.find({ following: parent._id }).populate('follower');
      return follows.map(follow => follow.follower);
    },
    following: async (parent, args, context) => {
      const follows = await Follow.find({ follower: parent._id }).populate('following');
      return follows.map(follow => follow.following);
    },
    followerCount: async (parent, args, context) => {
      return Follow.countDocuments({ following: parent._id });
    },
    followingCount: async (parent, args, context) => {
      return Follow.countDocuments({ follower: parent._id });
    },
    isFollowing: async (parent, args, context) => {
      if (!context || !context.user || !context.user._id) {
        return false;
      }
      const follow = await Follow.findOne({ follower: context.user._id, following: parent._id });
      return !!follow;
    },
  },
  
  // Field resolver for Comment
  Comment: {
    createdAt: (parent) => {
      return parent.createdAt ? parent.createdAt.toISOString() : null;
    },
  },
  
  // Field resolver for Like
  Like: {
    createdAt: (parent) => {
      return parent.createdAt ? parent.createdAt.toISOString() : null;
    },
  },
  
  // Field resolver for Notification
  Notification: {
    createdAt: (parent) => {
      return parent.createdAt ? parent.createdAt.toISOString() : null;
    },
  },
};

export default resolvers;


