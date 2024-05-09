import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const Profile = () => {
    const [user, setUser] = useState({
        name: '',
        avatar: '',
        toReadBooks: ['Book 1', 'Book 2', 'Book 3', 'Book 4', 'Book 5'],
        recentReviews: [
            { book: 'Book A', rating: null },
            { book: 'Book B', rating: null },
            { book: 'Book C', rating: null },
        ],
        clubs: ['Club X', 'Club Y'],
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            setUser({ ...user, avatar: reader.result });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="profile-page">
            <h2 className="profile-header">{user.name}'s Profile</h2>

            <div className="avatar-section">
                <h3>Avatar</h3>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                {user.avatar && <img src={user.avatar} alt="User Avatar" />}
            </div>

            <div className="to-read-section">
                <h3>To Read</h3>
                <ul>
                    {user.toReadBooks.map((book, index) => (
                        <li key={index}>{book}</li>
                    ))}
                </ul>
            </div>

            <div className="recent-reviews-section">
                <h3>Recent Reviews</h3>
                <ul>
                    {user.recentReviews.map((review, index) => (
                        <li key={index}>
                            {review.book} (Rating: {review.rating})
                        </li>
                    ))}
                </ul>
            </div>

            <div className="clubs-section">
                <h3>Clubs</h3>
                <ul>
                    {user.clubs.map((club, index) => (
                        <li key={index}>{club}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Profile;