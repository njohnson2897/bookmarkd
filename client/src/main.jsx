import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Review from './pages/Review.jsx';
import Search from './pages/Search.jsx';
import User from './pages/User.jsx';
import Error from './pages/Error.jsx';
import Club from './pages/Club.jsx';
import Profile from './pages/Profile.jsx';

import './index.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "books/:bookId",
        element: <Book />,
      },
      {
        path: "users",
        element: <User />,
      },
      {
        path: "profile/:profileId",
        element: <Profile />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "reviews",
        element: <Review />,
      },
      {
        path: "clubs",
        element: <Club />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

