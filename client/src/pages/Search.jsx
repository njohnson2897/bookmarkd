import { useState } from 'react';

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

    const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        rating: book.volumeInfo.averageRating
      }));

      setSearchedBook(bookData);

  } catch (error) {
    console.error("There was a problem fetching the data:", error);
  }
};

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
      {searchedBook.length > 0 && (
        <div key={searchedBook[0].bookId}>
          <p className='text-center'>{searchedBook[0].title}</p>
          <img 
            alt={searchedBook[0].title}
            className="img-fluid text-center"
            src={searchedBook[0].image}
          />
          <p>Author(s): {searchedBook[0].authors}</p>
          {searchedBook[0].rating ? (
            <p>Rating: {searchedBook[0].rating}</p>
          ) : null }
          {searchedBook[0].rating ? (
            <p>Description: {searchedBook[0].description}</p>
          ) : null }
        </div>
      )}
    </div>
  );
}

export default Search;
