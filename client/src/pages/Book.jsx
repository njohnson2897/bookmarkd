import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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

  return (
    <div className="book">
      <img src={book.coverImage} alt={`${book.title} Cover`} />
      <h3>{book.title}</h3>
      <p>Author: {book.author}</p>
      <p>{book.description}</p>
    </div>
  );
};

export default Book;