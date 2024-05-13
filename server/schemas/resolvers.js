const { User, Book, Club, Review } = require('../models');
const { AuthenticationError, signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        users: async ()  => {
            return User.find();
        },
        user: async (parent, {id}) => {
            return User.findOne({ _id: id }).populate(['books', 'reviews', 'clubs']);
        },
        books: async () => {
            return Book.find();
        },
        book: async (parent, {id}) => {
            return Book.findOne({ _id: id }).populate('reviews')
        },
        bookGoogle: async (parent, {googleId}) => {
            const bookExists = await Book.findOne({ google_id: googleId});
            if(bookExists){
                return bookExists;
            }
            return bookExists;
        },
        reviews: async () => {
            return Review.find();
        },
        review: async(parent, {id}) => {
            return Review.findOne({ _id: id })
        },
        clubs: async () => {
            return Club.find();
        },
        club: async (parent, {id}) => {
            return Club.findOne({ _id: id })
        }
    },

    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },
        addBook: async (parent, {google_id}) => {
            return Book.create({ google_id })
        },
        addBookStatus: async (parent, {book, user, status ,favorite}) => { 
            const {bookId} = await Book.findOne({google_id:book})
            return User.findOneAndUpdate(
                { _id: user },
                { $addToSet: { books: { bookId, status, favorite }}}
            )
        },
        addReview: async (parent, {book, user, stars, title, description}) => {
            const review = await Review.create({ book, user, stars, title, description });
            await User.findOneAndUpdate(
                { _id: user },
                { $addToSet: { reviews: review._id } }
            );
            await Book.findOneAndUpdate(
                { _id: book },
                { $addToSet: { reviews: review._id } }
            );
            return review;
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
        addClub: async (parent, {name, owner}) => {
            return Club.create({ name, owner });
        },
        deleteReview: async(parent, { reviewId }) => {
            const reviewData = await Review.findOne({ _id: reviewId })
            const updatedBook = await Book.findOneAndUpdate(
                { _id: reviewData.book },
                { $pull: { reviews: reviewId  } },
                { new : true}
            );
            const updatedUser = await User.findOneAndUpdate(
                { _id: reviewData.user },
                { $pull: { reviews: reviewId  } },
                {new: true}
            )
            return await Review.findOneAndDelete( { _id: reviewId } );
        },
        deleteClub: async (parent, { clubId }) => {
            const clubData = await Club.findOne({ _id: clubId });
            await User.findOneAndUpdate(
                { _id: clubData.owner },
                { $pull: { clubs: clubId } }
            );
            if(clubData.members){
                const noMembers = await clubData.owner.map((member) => {
                    User.findOneAndUpdate(
                        { _id: member },
                        { $pull: { clubs: clubId } }
                    );
                })
            }
            return await Club.findOneAndDelete( { _id: clubId } );
        },
        removeUserBook: async (parent, { bookId, userId }) => {
            return await User.findOneAndUpdate(
                { _id: userId},
                { $pull: { books: { book: bookId }}},
                { multi: true }
            );
        },
        editUserBookStatus: async (parent, { bookId, userId, status }) => {
            return await User.findOneAndUpdate(
                { _id: userId, 'books.book': bookId },
                { $set: { 'books.$.status': status } },
                { new: true}
            )
        },
        editUserBookFavorite: async (parent, { bookId, userId, favorite }) => {
            return await User.findOneAndUpdate(
                { _id: userId, 'books.book': bookId },
                { $set: { 'books.$.favorite': favorite } },
                { new: true}
            )
        },
        updateUser: async (parent, { id, bio, location, favBook, favAuthor }) => {
            return await User.findOneAndUpdate(
              { _id: id },
              { bio: bio, location: location, favBook: favBook, favAuthor: favAuthor },
              { new: true }
            )
      },
    }
};

module.exports = resolvers;