import { useState, useEffect } from 'react';

const generateRandomComment = (bookTitle) => {
  const adjectives = ['Amazing', 'Thoughtful', 'Captivating', 'Insightful', 'Engaging'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const reviewOptions = [
    `I found "${bookTitle}" to be ${randomAdjective.toLowerCase()} and thought-provoking.`,
    `The book "${bookTitle}" was ${randomAdjective.toLowerCase()} and kept me on the edge of my seat.`,
    `An ${randomAdjective.toLowerCase()} journey through the pages of "${bookTitle}".`,
    `Highly ${randomAdjective.toLowerCase()} and a must-read for all book lovers.`,
    `The author's writing in "${bookTitle}" is ${randomAdjective.toLowerCase()} and captivating.`,
    `A delightful read that I couldn't put down.`,
    `Intriguing and beautifully written, "${bookTitle}" is a gem.`,
    `I was completely absorbed in the world of "${bookTitle}".`,
    `A compelling story that will stay with me for a long time.`,
    `I highly recommend "${bookTitle}" to anyone looking for a great read.`,
  ];
  return reviewOptions[Math.floor(Math.random() * reviewOptions.length)];
};

const generateUniqueUsername = () => {
  const adjectives = ['Happy', 'Curious', 'Clever', 'Brave', 'Witty', 'Amused', 'Intriguing'];
  const nouns = ['Reader', 'Bookworm', 'Dreamer', 'Explorer', 'Enthusiast', 'Associate', 'Devotee'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${randomAdjective}${randomNoun}`;
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const generateRandomReviews = async () => {
      const getRandomRating = () => Math.floor(Math.random() * 5) + 1;
      const randomSeed = Date.now(); // Use timestamp as a random seed

      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=random&seed=${randomSeed}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch random books');
        }

        const data = await response.json();
        const randomReviews = data.items.map((item, index) => ({
          id: index + 1,
          bookTitle: item.volumeInfo.title,
          author: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown Author',
          reviewer: generateUniqueUsername(),
          rating: getRandomRating(),
          reviewText: generateRandomComment(item.volumeInfo.title),
          bookCover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '',
        }));

        // Shuffle the array of randomReviews
        const shuffledReviews = randomReviews.sort(() => Math.random() - 0.5);
        setReviews(shuffledReviews);
      } catch (error) {
        console.error('Error fetching random books:', error);
      }
    };

    generateRandomReviews();
  }, []);

  return (
    <div className="reviews-page">
      <h1>Book Reviews</h1>
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card border border-black py-3 my-3">
            <img src={review.bookCover} alt={review.bookTitle} />
            <h2>{review.bookTitle}</h2>
            <p>By {review.author}</p>
            <p>Reviewed by {review.reviewer}</p>
            <p>{review.reviewText}</p>
            <div className="rating mb-3">
              {[...Array(5)].map((_, index) => (
                <span key={index} role="img" aria-label="star">
                  ⭐️
                </span>
              ))}
            </div>
            <button className='mx-2'>Like</button>
            <button className='mx-2'>Comment</button>
            <button className='mx-2'>Share</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;