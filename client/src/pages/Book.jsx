import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { QUERY_BOOKGOOGLE } from '../utils/queries';
import { ADD_BOOK_STATUS, ADD_BOOK } from '../utils/mutations';
import decode from 'jwt-decode';
import Auth from '../utils/auth';

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
  const { loading, data, refetch } = useQuery(QUERY_BOOKGOOGLE, {
    variables: {googleId: bookId}
  })
  const [addBook, { error }] = useMutation(ADD_BOOK);
  
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

  useEffect(() => {
    const checkForBook = async () => {
      try { 
        console.log(data);
        if(data === undefined){}
        else{
        data.bookGoogle ? console.log("Book Exists") : await addBook({ variables: { googleId: bookId } })
        }
      } catch (err) {
        console.error(err);
      }
    }
    checkForBook();
  }, [data, addBook])

  const [addBookStatusMutation] = useMutation(ADD_BOOK_STATUS);

    const getUserId = () => {
      const idToken = localStorage.getItem('id_token')
      const decoded = decode(idToken)
      console.log(decoded.data._id)
      return decoded.data._id
    };

    const handleSaveBook = async () => {
      const realBookId = data.bookGoogle._id
      try {
        console.log(realBookId)
        await addBookStatusMutation({
          variables: {
            book: realBookId,
            user: getUserId(), // Add the user ID if needed
            status: "To-Read",
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
      <div className="book border border-black my-3 p-3">
        <img src={book.coverImage} className='mt-3' alt={`${book.title} Cover`} />
        <h3>{book.title}</h3>
        <p>Author: {book.author}</p>
        <p>{book.description}</p>
        {loading ? (
          <div>loading...</div>
        ):Auth.getToken()?( 
        <button
          className='btn-block btn-info'
          onClick={() => handleSaveBook(book)}>Save
        </button>):""}
      </div>
    );
  };

export default Book;