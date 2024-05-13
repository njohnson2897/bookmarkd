import { useQuery } from '@apollo/client';
import { QUERY_USERS } from '../utils/queries';
import UserCard from '../components/UserCard';

const User = () => {

  const { loading, error, data } = useQuery(QUERY_USERS);

  if (loading) return <div>Loading</div>

  if (error) return <div>Error: {error.message}</div>

  const users = data?.users || []

  console.log(users)
  
  return (
    <main>
      <div className="flex-row justify-center">
        <div className="col-12 mb-3">
          {/* If the data is still loading, render a loading message */}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div>
            {users.map((user) => (
              <UserCard key={user._id} user={user}></UserCard>
            ))}
            </div>
      )}
        </div>
      </div>
    </main>
  );
};

export default User;