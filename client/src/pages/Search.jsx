import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Search() {
  const [searchedBook, setSearchedBook] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedRating, setSelectedRating] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const bookTitle = document.getElementById('booksearch').value.trim();

    if (!bookTitle) {
      alert('Please enter a book title.');
      return;
    }

    try {
      let Url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&maxResults=9`;

      if (selectedYear) {
        Url += `&year=${selectedYear}`;
      }
      if (selectedGenre) {
        Url += `&genre=${selectedGenre}`;
      }
      if (selectedRating) {
        Url += `&rating=${selectedRating}`;
      }

      const response = await fetch(Url);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
        rating: book.volumeInfo.averageRating,
      }));

      setSearchedBook(bookData);
    } catch (error) {
      console.error('There was a problem fetching the data:', error);
    }
  };

  const navigate = useNavigate();

  return (
    <div>
      <form className='mb-3' onSubmit={handleFormSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>

        <div className='mt-4' style={{ flexBasis: '100%' }}>
          <label htmlFor="booksearch" className="form-label">
            Enter a book title here:
          </label>
          <input
            type="text"
            className="form-control"
            id="booksearch" />
        </div>

        <div className="mb-3">
          <label htmlFor="yearFilter" className="form-label">
            Filter by Year:
          </label>
          <input
            type="text"
            className="form-control"
            id="yearFilter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            placeholder="Enter a year"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="genreFilter" className="form-label">
            Filter by Genre:
          </label>
          <input
            type="text"
            className="form-control"
            id="genreFilter"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            placeholder="Enter a genre"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="ratingFilter" className="form-label">
            Filter by Rating:
          </label>
          <input
            type="range"
            className="form-range"
            id="ratingFilter"
            min="0"
            max="5"
            step="0.1"
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
          />
          <output>{selectedRating}</output>
        </div>

        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {searchedBook.map((book) => (
          <div key={book.bookId} className='border border-black'>
            <img
              alt={book.title}
              style={{ maxWidth: '100%' }}
              className='mt-3'
              src={book.image}
              onClick={() => navigate(`/books/${book.bookId}`)}
            />
            <p>{book.title}</p>
            <p>Author(s): {book.authors}</p>
            {book.rating && <p>Rating: {book.rating}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;