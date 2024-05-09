const { User, Book, Club, Review } = require('../models')


const resolvers = {
    Query: {
        users: async ()  => {
            return User.find();
        },
        books: async () => {
            return Book.find();
        },
        reviews: async () => {
            return Review.find();
        },
        clubs: async () => {
            return Club.find();
        }
    },

    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            return User.create({ username, email, password });
        },
        addBook: async (parent, {google_id}) => {
            return Book.create({ google_id })
        },
        addBookStatus: async (parent, {book, user, status ,favorite}) => {
            return User.findOneAndUpdate(
                { _id: user },
                { $addToSet: { books: { book, status, favorite }}}
            )
        },
        addReview: async (parent, {book_id, user_id, stars, title, description}) => {
            const review = await Review.create({ book_id, user_id, stars, title, description });
            await User.findOneAndUpdate(
                { _id: user_id },
                { $addToSet: { reviews: review._id } }
            );
            await Book.findOneAndUpdate(
                { _id: book_id },
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
            
        }
    }
};

module.exports = resolvers;