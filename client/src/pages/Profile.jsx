import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { QUERY_USER } from "../utils/queries";

// good example in module 21 activity 25

const Profile = () => {
  const { profileId } = useParams();

  console.log(profileId);

  const { loading, data } = useQuery(QUERY_USER, {
    variables: { userId: profileId },
  });

  const user = data?.user || {};

  if (loading) {
    return <div> Loading... </div>;
  }

  return (
    <div className="profile-page my-3">
      <h1 className="profile-header my-3">{user.username}'s Profile</h1>
      <div className='border border-black'>

      <h4 className='mt-3 mb-5'>To Read:</h4>
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
                {review.book} (Rating: {review.rating})
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
              <li key={index}>{club}</li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
};

export default Profile;
