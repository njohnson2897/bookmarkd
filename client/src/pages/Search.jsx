require('dotenv').config();

const handleFormSubmit = async (e) => {
  e.preventDefault();

  const bookTitle = document.getElementById("booksearch").value.trim();

  if (!bookTitle) {
    alert("Please enter a book title.");
    return;
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookTitle)}&key=${process.env.API_KEY}`
    );

    if (!response.ok) {
        console.log(response.status);
        console.log(response.statusText);
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    console.log(data);
  } catch (error) {
    console.error("There was a problem fetching the data:", error);
  }
};

function Search() {
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
    </div>
  );
}

export default Search;
