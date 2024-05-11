import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {

const  [searchedBook, setSearchedBook]  =  useState([]);

const handleFormSubmit = async (e) => {
  e.preventDefault();

  const bookTitle = document.getElementById("booksearch").value.trim();

  if (!bookTitle) {
    alert("Please enter a book title.");
    return;
  }

  try {
    const Url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}`
    const response = await fetch(Url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const  { items } = await response.json();
    console.log(items);
    const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        rating: book.volumeInfo.averageRating
      }));

      setSearchedBook(bookData);

  } catch (error) {
    console.error("There was a problem fetching the data:", error);
  }

};

const navigate = useNavigate();

return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <label htmlFor="booksearch" className="form-label">
            Enter a book title here:
          </label>
          <input type="text" className="form-control" id="booksearch" />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      {searchedBook.map((book) => (
  <div key={book.bookId}>
    <p className='text-center'>{book.title}</p>
    <img 
      alt={book.title}
      className="img-fluid text-center"
      src={book.image}
      onClick={(event) => {
        event.preventDefault();
        navigate(`/books/${book.bookId}`)
      }}
    />
    <p>Author(s): {book.authors}</p>
    {book.rating && (
      <p>Rating: {book.rating}</p>
    )}
  </div>
))}
    </div>
  );
}

export default Search;
