import { User, Book, Club, Review } from '../models/index.js';
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
    }
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
    deleteReview: async (parent, { reviewId }, context) => {
      // User must be authenticated
      requireAuth(context);
      
      const reviewData = await Review.findOne({ _id: reviewId });
      if (!reviewData) {
        throw new Error('Review not found');
      }
      
      // Only the review owner can delete their review
      requireAuthAndMatch(context, reviewData.user);
      
      await Book.findOneAndUpdate(
        { _id: reviewData.book },
        { $pull: { reviews: reviewId } },
        { new: true }
      );
      await User.findOneAndUpdate(
        { _id: reviewData.user },
        { $pull: { reviews: reviewId } },
        { new: true }
      );
      return Review.findOneAndDelete({ _id: reviewId });
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
  }
};

export default resolvers;


