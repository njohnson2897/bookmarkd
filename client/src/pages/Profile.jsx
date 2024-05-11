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
    <div className="profile-page">
      <h2 className="profile-header">{user.username}'s Profile</h2>

      <h3>To Read:</h3>
      {user.books.length > 0 && (
        <div className="to-read-section">
          <ul>
            {user.books.map((book, index) => (
              <li key={index}>{book.title}</li>
            ))}
          </ul>
        </div>
      )}
      <h3>Recent Reviews:</h3>
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
        <h3>Clubs:</h3>
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
  );
};

export default Profile;
