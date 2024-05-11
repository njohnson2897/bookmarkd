import { useNavigate } from 'react-router-dom';

// got useNavigate syntax from here: https://reactrouter.com/en/main/hooks/use-navigate

const UserCard = ( props ) =>  {
    const navigate = useNavigate();
    console.log(props)

    const goToUser = (event) => {
        event.preventDefault();
        navigate(`/profile/${props.user._id}`);
    };

    return (
        <div className='book-snob border border-black my-3' onClick={goToUser}>
            <h1>{props.user.username}</h1>
                <p>Clubs: {props.user.clubs}</p>
                <p>Books: {props.user.books}</p>
                <p>Reviews: {props.user.reviews}</p>
        </div>
    )
}

export default UserCard;