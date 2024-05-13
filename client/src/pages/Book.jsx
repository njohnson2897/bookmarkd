import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { QUERY_BOOKGOOGLE } from '../utils/queries';
import { ADD_BOOK_STATUS } from '../utils/mutations'; 
import decode from 'jwt-decode';

const Book = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [book, setBook] = useState({
    // U68lAAAAMAAJ
    coverImage: '',
    title: 'Title Goes Here',
    author: 'Author Goes Here',
    description: 'Description Goes Here'
  });
  const { bookId } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const url = `https://www.googleapis.com/books/v1/volumes/${bookId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        
        const bookResponse = await response.json();
        const newBook = {
          coverImage: bookResponse.volumeInfo.imageLinks.smallThumbnail,
          title: bookResponse.volumeInfo.title,
          author: bookResponse.volumeInfo.authors[0],
          description: bookResponse.volumeInfo.description
        };
        
        setBook(newBook);
        console.log(bookResponse);
      } catch (error) {
        console.error(error);
        // Handle error, e.g., set a state for error message
      }
    };

    fetchBook();
  }, [bookId]);

   // create function to handle saving a book to our database
    
    const [addBookStatusMutation] = useMutation(ADD_BOOK_STATUS);

    const getUserId = () => {
      const idToken = localStorage.getItem('id_token')
      const decoded = decode(idToken)
      console.log(decoded.data._id)
      return decoded.data._id
    };

    const { loading, data, refetch } = useQuery(QUERY_BOOKGOOGLE, {
      variables: {googleId: bookId}
    });
  const bookDataId = data || []
    const handleSaveBook = async (book) => {
      console.log(bookDataId)
      try {
        await addBookStatusMutation({
          variables: {
            book: bookId,
            user: getUserId(), // Add the user ID if needed
            status: "reading",
            favorite: false
          }
        });
        // Handle response if needed
      } catch (error) {
        console.error(error);
        // Handle error, e.g., set a state for error message
      }
    };
  
  return (
    <div className="book">
      <img src={book.coverImage} alt={`${book.title} Cover`} />
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>{book.description}</p>
      {loading ? (
        <div>loading...</div>
      ):( 
      <button
        className='btn-block btn-info'
        onClick={() => handleSaveBook(book)}>Save
      </button>)}
    </div>
  );
};

export default Book;