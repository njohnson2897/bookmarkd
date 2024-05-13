import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { QUERY_USER } from "../utils/queries";
import { UPDATE_USER } from '../utils/mutations';
import Auth from '../utils/auth';
import { useState } from 'react';

// good example in module 21 activity 25

const Profile = () => {
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    favBook: '',
    favAuthor: ''
});

const [updateUser, error] = useMutation(UPDATE_USER);

const token = Auth.getProfile();

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({
      ...formData,
      [name]: value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log(formData);
  console.log(token.data._id)
  try {
    await updateUser({
      variables: {updateUserId: token.data._id, ...formData}
    })
    window.location.assign(`/profile/${token.data._id}`);
  } catch {error} {
    console.log('Error updating user:', error)
  }

};

  const { profileId } = useParams();

  const { loading, data } = useQuery(QUERY_USER, {
    variables: { userId: profileId },
  });

  const user = data?.user || {};

  console.log(user);

  if (loading) {
    return <div> Loading... </div>;

  } else if (!user.bio && !user.location && !user.favBook && !user.favAuthor && profileId === token.data._id )  {

    return (
      <div>
          <h3 className='my-3'>Please Provide Some Additional Information:</h3>
          <form className='border border-black' onSubmit={handleSubmit}>
              <div className='my-3'>
                  <label htmlFor="bio">Tell us about yourself:</label><br />
                  <textarea id="bio" name="bio" rows="4" cols="50" value={formData.bio} onChange={handleChange}/>
              </div>
              <div  className='my-3'>
                  <label htmlFor="location">Where are you located?</label><br />
                  <input type="text" id="location" name="location" value={formData.location} onChange={handleChange}/>
              </div>
              <div className='my-3'>
                  <label htmlFor="favBook">Your favorite book:</label><br />
                  <input type="text" id="favBook" name="favBook" value={formData.favoriteBook} onChange={handleChange} />
              </div>
              <div className='my-3'>
                  <label htmlFor="favAuthor">Your favorite author:</label><br />
                  <input type="text" id="favAuthor" name="favAuthor" value={formData.favoriteAuthor} onChange={handleChange}/>
              </div>
              <div className='my-3'>
                  <input type="submit" value="Submit" className='btn btn-primary mb-4' />
              </div>
          </form>
      </div>
  );
  } else if (profileId !== token.data._id || !token || user.bio || user.location || user.favBook || user.favAuthor ) {

  return (
    <div className="profile-page my-3">
      <h1 className="profile-header my-3">{user.username}'s Profile</h1>
      <div className='border border-black'>
      <h4 className='mt-3 mb-5'>Bio:</h4>
      <p>{user.bio}</p>
      <h4 className='my-5'>Location:</h4>
      <p>{user.location}</p>
      <h4 className='my-5'>Favorite Book:</h4>
      <p>{user.favBook}</p>
      <h4 className='my-5'>Favorite Author:</h4>
      <p>{user.favAuthor}</p>
      <h4 className='my-5'>Recently Read:</h4>
      {user.books.length > 0 && (
        <div className="to-read-section">
          <ul>
            {user.books.map((book, index) => (
              <li key={index}>{book.title}</li>
            ))}
          </ul>
        </div>
      )}
      <h4 className='my-5'>Recent Reviews:</h4>
      {user.reviews.length > 0 && (
        <div className="recent-reviews-section">
          <ul>
            {user.reviews.map((review, index) => (
              <li key={index}>
                {review.book.title} (Rating: {review.rating})
              </li>
            ))}
          </ul>
        </div>
      )}
        <h4 className='my-5'>Clubs:</h4>
      {user.clubs.length > 0 && (
        <div className="clubs-section">
          <ul>
            {user.clubs.map((club, index) => (
              <li key={index}>{club.name}</li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
}
};

export default Profile;
