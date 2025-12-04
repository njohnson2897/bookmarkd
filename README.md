# Bookmarkd

A social media platform for book lovers - like Letterboxd, but for books!

## Description

Bookmarkd is a social media / book review website where users can:

- Create an account and build their personal book collection
- Add books to their reading list (To-Read, Currently Reading, Finished)
- Post reviews of books they've finished
- Browse and search books using the Google Books API
- View other users' profiles and review history
- Join book clubs with other users reading the same book
- Comment on and like other users' reviews

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Apollo Client
- **Backend**: Node.js, Express, Apollo Server (GraphQL)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **External API**: Google Books API

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install
   ```
3. Set up environment variables:
   - Create a `.env` file in the `server` directory
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb://127.0.0.1:27017/bookmarkd
     JWT_SECRET=your-secret-key-here
     ```
4. Start the development servers:
   ```bash
   npm run develop
   ```
   - Client runs on http://localhost:3000
   - Server runs on http://localhost:3001


## Project Structure

```
bookmarkd/
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions (auth, queries, mutations)
│   │   └── ...
│   └── public/      # Static assets
└── server/          # Express/GraphQL backend
    ├── config/      # Database connection
    ├── models/      # Mongoose models
    ├── schemas/     # GraphQL typeDefs and resolvers
    └── utils/       # Authentication utilities
```

## Features

- User authentication (sign up, login, logout)
- Book search and browsing via Google Books API
- Personal book collections with status tracking
- Book reviews with star ratings
- User profiles with bio, location, favorite book/author
- Book clubs functionality
- Responsive design with Tailwind CSS

## Credits

Created by: Alexa Aguinada, Domas Dargis, Nate Johnson, & Robin Langton
