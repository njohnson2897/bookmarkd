import { User, Book, Club, Review } from '../models/index.js';
import { AuthenticationError, signToken } from '../utils/auth.js';

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
        'clubs'
      ]);
      
      // Filter out reviews with invalid books for each user
      users.forEach(user => {
        if (user.reviews) {
          user.reviews = user.reviews.filter(review => review.book && review.book.google_id);
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
        'clubs'
      ]);
      
      // Filter out reviews with invalid books (books without google_id)
      if (user && user.reviews) {
        user.reviews = user.reviews.filter(review => review.book && review.book.google_id);
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
    addBookStatus: async (parent, { book, user, status, favorite }) => {
      return User.findOneAndUpdate(
        { _id: user },
        { $addToSet: { books: { book, status, favorite } } },
        { new: true }
      ).populate('books.book');
    },
    addReview: async (parent, { book, user, stars, title, description }) => {
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
    addClub: async (parent, { name, owner }) => {
      const club = await Club.create({ name, owner });
      await User.findOneAndUpdate(
        { _id: owner },
        { $addToSet: { clubs: club._id } }
      );
      return Club.findById(club._id).populate(['owner', 'members']);
    },
    addClubMember: async (parent, { clubId, userId }) => {
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
    removeClubMember: async (parent, { clubId, userId }) => {
      const club = await Club.findById(clubId);
      if (!club) {
        throw new Error('Club not found');
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
    deleteReview: async (parent, { reviewId }) => {
      const reviewData = await Review.findOne({ _id: reviewId });
      if (!reviewData) {
        throw new Error('Review not found');
      }
      
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
    deleteClub: async (parent, { clubId }) => {
      const clubData = await Club.findOne({ _id: clubId });
      if (!clubData) {
        throw new Error('Club not found');
      }

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
    removeUserBook: async (parent, { bookId, userId }) => {
      return User.findOneAndUpdate(
        { _id: userId },
        { $pull: { books: { book: bookId } } },
        { new: true }
      ).populate('books.book');
    },
    editUserBookStatus: async (parent, { bookId, userId, status }) => {
      return User.findOneAndUpdate(
        { _id: userId, 'books.book': bookId },
        { $set: { 'books.$.status': status } },
        { new: true }
      ).populate('books.book');
    },
    editUserBookFavorite: async (parent, { bookId, userId, favorite }) => {
      return User.findOneAndUpdate(
        { _id: userId, 'books.book': bookId },
        { $set: { 'books.$.favorite': favorite } },
        { new: true }
      ).populate('books.book');
    },
    updateUser: async (parent, { id, bio, location, favBook, favAuthor }) => {
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


