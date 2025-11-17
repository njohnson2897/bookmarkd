import { useNavigate } from "react-router-dom";

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const goToUser = (event) => {
    event.preventDefault();
    navigate(`/profile/${user._id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:bg-primary1 hover:text-white transition border border-gray-200"
      onClick={goToUser}
    >
      <h1 className="text-xl font-bold mb-2">{user.username}</h1>
      <p className="text-sm mb-1">Email: {user.email}</p>
      <p className="text-sm mb-1">Books: {user.books?.length || 0}</p>
      <p className="text-sm mb-1">Clubs: {user.clubs?.length || 0}</p>
      <p className="text-sm">Reviews: {user.reviews?.length || 0}</p>
    </div>
  );
};

export default UserCard;

