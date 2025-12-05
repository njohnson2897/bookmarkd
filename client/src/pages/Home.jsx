import Auth from "../utils/auth.js";
import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useLocation } from "react-router-dom";
import { LOGIN_USER, ADD_USER } from "../utils/mutations.js";
import { QUERY_USER, QUERY_ACTIVITY_FEED } from "../utils/queries.js";
import Slider from "react-slick";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Auth.loggedIn();
  const userId = isLoggedIn ? Auth.getProfile()?.data?._id : null;

  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [signUpState, setSignUpState] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [login, { error: loginError }] = useMutation(LOGIN_USER);
  const [addUser, { error: signUpError }] = useMutation(ADD_USER);

  // Fetch user data for logged-in users
  const { data: userData } = useQuery(QUERY_USER, {
    variables: { userId },
    skip: !userId,
  });

  // Fetch activity feed for logged-in users
  const { data: activityData } = useQuery(QUERY_ACTIVITY_FEED, {
    variables: { userId },
    skip: !userId,
  });

  const user = userData?.user;
  const activities = activityData?.activityFeed || [];

  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    draggable: true,
    beforeChange: (current, next) => setCurrentSlide(next),
    // Prevent dragging when interacting with form elements
    swipeToSlide: false,
  };

  // Prevent carousel drag on form elements
  const handleFormMouseDown = (e) => {
    e.stopPropagation();
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToSignUp = () => {
    sliderRef.current?.slickGoTo(1);
    setCurrentSlide(1);
  };

  const goToSignIn = () => {
    sliderRef.current?.slickGoTo(2);
    setCurrentSlide(2);
  };

  // Check for hash on mount or when location changes to navigate to correct slide
  useEffect(() => {
    if (!isLoggedIn && location.hash && sliderRef.current) {
      if (location.hash === "#signup") {
        sliderRef.current.slickGoTo(1);
        setCurrentSlide(1);
      } else if (location.hash === "#signin") {
        sliderRef.current.slickGoTo(2);
        setCurrentSlide(2);
      }
    }
  }, [location.hash, isLoggedIn]);

  // update state based on form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleSignUpChange = (event) => {
    const { name, value } = event.target;
    setSignUpState({
      ...signUpState,
      [name]: value,
    });
  };

  // submit form
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const { data } = await login({
        variables: { ...formState },
      });
      if (data?.login?.token) {
        Auth.login(data.login.token);
        // Refresh page to show logged-in view
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    setFormState({ email: "", password: "" });
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const { data } = await addUser({
        variables: { ...signUpState },
      });
      if (data?.addUser?.token) {
        Auth.login(data.addUser.token);
        // Refresh page to show logged-in view
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
    setSignUpState({ username: "", email: "", password: "" });
  };

  // Calculate user stats
  const calculateStats = () => {
    if (!user) return null;
    const books = user.books || [];
    const reviews = user.reviews || [];

    return {
      totalBooks: books.length,
      finishedBooks: books.filter((b) => b.status === "Finished").length,
      totalReviews: reviews.length,
      avgRating:
        reviews.length > 0
          ? (
              reviews.reduce((sum, r) => sum + (r.stars || 0), 0) /
              reviews.length
            ).toFixed(1)
          : "0.0",
    };
  };

  const stats = calculateStats();

  // If user is logged in, show dashboard
  if (isLoggedIn && user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary2 to-primary1 rounded-t-lg p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-white/90">
            Continue your reading journey and discover new books
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-primary2">
                {stats.totalBooks}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Books</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-primary2">
                {stats.finishedBooks}
              </div>
              <div className="text-sm text-gray-600 mt-1">Finished</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-primary2">
                {stats.totalReviews}
              </div>
              <div className="text-sm text-gray-600 mt-1">Reviews</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-primary2">
                {stats.avgRating}
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-primary2 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/search")}
              className="bg-primary1 text-white p-4 rounded-lg hover:bg-accent transition text-center"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-semibold">Browse Books</div>
            </button>
            <button
              onClick={() => navigate(`/profile/${userId}`)}
              className="bg-primary2 text-white p-4 rounded-lg hover:bg-primary1 transition text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-semibold">My Profile</div>
            </button>
            <button
              onClick={() => navigate("/my-books")}
              className="bg-accent text-white p-4 rounded-lg hover:bg-primary1 transition text-center"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">My Books</div>
            </button>
            <button
              onClick={() => navigate("/activity")}
              className="bg-primary1/80 text-white p-4 rounded-lg hover:bg-primary1 transition text-center"
            >
              <div className="text-2xl mb-2">📰</div>
              <div className="font-semibold">Activity</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary2">
                Recent Activity
              </h2>
              <button
                onClick={() => navigate("/activity")}
                className="text-primary1 hover:text-primary2 font-semibold"
              >
                View All →
              </button>
            </div>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => {
                if (activity.type !== "review" || !activity.review) return null;
                return (
                  <div
                    key={activity._id}
                    className="border-l-4 border-primary1 pl-4 py-2 hover:bg-gray-50 rounded-r transition cursor-pointer"
                    onClick={() =>
                      navigate(`/books/${activity.review?.book?.google_id}`)
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-primary2">
                        {activity.user?.username}
                      </span>
                      <span className="text-gray-600">reviewed</span>
                    </div>
                    {activity.review.title && (
                      <p className="font-medium text-gray-800">
                        {activity.review.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-yellow-400">
                        {"★".repeat(Math.round(activity.review.stars))}
                        {"☆".repeat(5 - Math.round(activity.review.stars))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not logged in - show carousel with sign up/sign in
  return (
    <section className="bg-gradient-to-r from-primary2 to-primary1 min-h-[60vh] flex flex-col justify-center py-12 relative">
      {/* Previous Arrow - only show when not on first slide */}
      {currentSlide > 0 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary2 rounded-full p-2 shadow-lg transition"
          aria-label="Previous slide"
        >
          <img src="/images/prev.png" alt="Previous" className="w-6 h-6" />
        </button>
      )}

      {/* Next Arrow - only show when on sign up slide (slide 1) */}
      {currentSlide === 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-primary2 rounded-full p-2 shadow-lg transition"
          aria-label="Next slide"
        >
          <img src="/images/next.png" alt="Next" className="w-6 h-6" />
        </button>
      )}

      <Slider ref={sliderRef} {...sliderSettings} className="w-full">
        {/* Hero Slide */}
        <div className="px-4">
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-12 py-8">
            <div className="flex-1 flex flex-col gap-6 items-start">
              <div className="mb-2">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 leading-tight">
                  Bookmarkd
                </h1>
                <div className="h-1 w-24 bg-white/30 rounded-full"></div>
              </div>
              <p className="text-xl md:text-2xl text-white/95 font-medium">
                The social network for book lovers.
              </p>
              <p className="text-lg text-white/90 max-w-md leading-relaxed">
                Because life's too short for a book you're not in the mood for.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  onClick={goToSignUp}
                  className="bg-primary1 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-accent transition font-semibold text-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                </button>
                <button
                  onClick={goToSignIn}
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-3 rounded-lg hover:bg-white/20 transition font-semibold text-lg"
                >
                  Sign In
                </button>
              </div>
              <div className="flex items-center gap-6 mt-6 text-white/80">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">Discover Books</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="text-sm font-medium">Join Community</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Share Reviews</span>
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-2xl"></div>
                <img
                  src="/images/header.png"
                  alt="Hero"
                  className="relative w-full max-w-xl h-auto transform hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sign Up Form Slide */}
        <div className="px-4">
          <div className="container mx-auto max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-white/90">Join the community of book lovers</p>
            </div>
            <form
              onSubmit={handleSignUp}
              onMouseDown={handleFormMouseDown}
              className="bg-white rounded-xl shadow-2xl p-8 flex flex-col gap-5"
              style={{ touchAction: "pan-y" }}
            >
              {signUpError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm">
                  {signUpError.message ||
                    "Error creating account. Please try again."}
                </div>
              )}
              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Username
                </label>
                <input
                  id="signup-username"
                  onChange={handleSignUpChange}
                  value={signUpState.username}
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  onMouseDown={handleFormMouseDown}
                  onTouchStart={handleFormMouseDown}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary1 focus:ring-2 focus:ring-primary1/20 transition"
                  style={{ touchAction: "manipulation" }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="signup-email"
                  onChange={handleSignUpChange}
                  value={signUpState.email}
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  onMouseDown={handleFormMouseDown}
                  onTouchStart={handleFormMouseDown}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary1 focus:ring-2 focus:ring-primary1/20 transition"
                  style={{ touchAction: "manipulation" }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  onChange={handleSignUpChange}
                  value={signUpState.password}
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  onMouseDown={handleFormMouseDown}
                  onTouchStart={handleFormMouseDown}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary1 focus:ring-2 focus:ring-primary1/20 transition"
                  style={{ touchAction: "manipulation" }}
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>
              <button
                type="submit"
                className="w-full bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg"
              >
                Create Account
              </button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={goToSignIn}
                  className="text-primary1 hover:text-primary2 font-semibold"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* Sign In Form Slide */}
        <div className="px-4">
          <div className="container mx-auto max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-white/90">
                Sign in to continue your reading journey
              </p>
            </div>
            <form
              onSubmit={handleLogin}
              onMouseDown={handleFormMouseDown}
              className="bg-white rounded-xl shadow-2xl p-8 flex flex-col gap-5"
              style={{ touchAction: "pan-y" }}
            >
              {loginError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm">
                  {loginError.message || "Invalid email or password"}
                </div>
              )}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  onChange={handleChange}
                  value={formState.email}
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  onMouseDown={handleFormMouseDown}
                  onTouchStart={handleFormMouseDown}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary1 focus:ring-2 focus:ring-primary1/20 transition"
                  style={{ touchAction: "manipulation" }}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  onChange={handleChange}
                  value={formState.password}
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  onMouseDown={handleFormMouseDown}
                  onTouchStart={handleFormMouseDown}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-primary1 focus:ring-2 focus:ring-primary1/20 transition"
                  style={{ touchAction: "manipulation" }}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary1 text-white px-6 py-3 rounded-lg hover:bg-accent transition font-semibold text-lg shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={goToSignUp}
                  className="text-primary1 hover:text-primary2 font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </form>
          </div>
        </div>
      </Slider>
    </section>
  );
}
