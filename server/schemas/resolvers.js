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
    }
};

module.exports = resolvers;