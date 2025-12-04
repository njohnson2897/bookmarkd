import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { typeDefs, resolvers } from './schemas/index.js';
import db from './config/connection.js';
import { authMiddleware } from './utils/auth.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error('GraphQL Error:', err);
    return {
      message: err.message,
      extensions: err.extensions,
    };
  },
});

const startApolloServer = async () => {
  await server.start();
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  // Serve static files from the React app in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Serve the React app for all non-API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // Log MongoDB connection status
  console.log('Waiting for MongoDB connection...');
  
  db.once('open', () => {
    console.log('MongoDB connection established');
  });

  db.on('error', (err) => {
    console.error('Database connection error:', err);
    console.error('Make sure MongoDB is running on mongodb://127.0.0.1:27017');
  });

  // Start server regardless of DB connection status
  // This allows the server to start even if MongoDB isn't running yet
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    if (db.readyState !== 1) {
      console.warn('⚠️  Warning: MongoDB is not connected. Some operations may fail.');
    }
  });
};

startApolloServer().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});


