import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'mysecretssshhhhhhh';
const expiration = '4h';

export const AuthenticationError = new GraphQLError('Could not authenticate user.', {
  extensions: {
    code: 'UNAUTHENTICATED',
  },
});

export const AuthorizationError = new GraphQLError('You are not authorized to perform this action.', {
  extensions: {
    code: 'FORBIDDEN',
  },
});

// Helper function to check if user is authenticated
export const requireAuth = (context) => {
  if (!context || !context.user || !context.user._id) {
    throw AuthenticationError;
  }
  return context.user;
};

// Helper function to check if user is authorized (matches userId)
export const requireAuthAndMatch = (context, userId) => {
  const user = requireAuth(context);
  if (user._id.toString() !== userId.toString()) {
    throw AuthorizationError;
  }
  return user;
};

// Helper function to check if user is authorized (matches userId or is optional)
export const requireAuthAndMatchOptional = (context, userId) => {
  if (!userId) {
    return requireAuth(context);
  }
  return requireAuthAndMatch(context, userId);
};

export const authMiddleware = function ({ req }) {
  // allows token to be sent via req.query or headers
  let token = req.query.token || req.headers.authorization || req.body.token;

  // ["Bearer", "<tokenvalue>"]
  if (req.headers.authorization) {
    token = token.split(' ').pop().trim();
  }

  if (!token) {
    return req;
  }

  // verify token and get user data out of it
  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    req.user = data;
  } catch (error) {
    console.log('Invalid token');
  }

  return req;
};

export const signToken = function ({ email, username, _id }) {
  const payload = { email, username, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};


