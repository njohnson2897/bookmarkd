import React from 'react';

const User = () => {
  const isAuthenticated = true;

  const bookSnobs = [
    { id: 1, name: 'Book Snob 1', club: 'Reading Club 1' },
    { id: 2, name: 'Book Snob 2', club: 'Reading Club 2' },
    { id: 3, name: 'Book Snob 3', club: 'Reading Club 3' }
  ];

  return (
    <div className='user-container'>
      <div className='user-header'>
        {isAuthenticated ? (
          <>
            <button>Books</button>
            <button>Users</button>
            <button>Clubs</button>
          </>
        ) : (
          <>
            <button>Sign In</button>
            <button>Create Account</button>
          </>
        )}
      </div>
      <h2 className='popular-snobs'>Popular Snobs</h2>
      <div className="user-profiles">
        {users.map((user) => (
          <div key={user.id} className="user-profile">
            <img src={user.image} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ))}
        <div className="book-snobs">
          <h3>Book Snobs</h3>
          {bookSnobs.map((bookSnob) => (
            <div key={bookSnob.id} className="book-snob">
              <p>{bookSnob.name} - {bookSnob.club}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default User;