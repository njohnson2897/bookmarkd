import { useQuery } from "@apollo/client";
import { QUERY_USERS } from "../utils/queries.js";
import UserCard from "../components/UserCard.jsx";

const User = () => {
  const { loading, error, data } = useQuery(QUERY_USERS);
  
  if (loading) {
    return (
      <div className="text-center py-10 text-lg text-primary2">Loading...</div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10 text-lg text-red-500">
        Error: {error.message}
      </div>
    );
  }
  
  const users = data?.users || [];
  
  return (
    <main className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-primary2 mb-8 text-center">
        Users
      </h1>
      {users.length === 0 ? (
        <div className="text-center py-10 text-lg text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </main>
  );
};

export default User;

