import Auth from "../utils/auth.js";
import React, { useState, useRef } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, ADD_USER } from "../utils/mutations.js";
import Slider from "react-slick";

export default function Home() {
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
  };

  const goToPrev = () => {
    sliderRef.current?.slickPrev();
  };

  const goToNext = () => {
    sliderRef.current?.slickNext();
  };

  const goToSignUp = () => {
    sliderRef.current?.slickGoTo(1);
  };

  const goToSignIn = () => {
    sliderRef.current?.slickGoTo(2);
  };

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
      }
    } catch (e) {
      console.error(e);
    }
    setSignUpState({ username: "", email: "", password: "" });
  };

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
          <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 flex flex-col gap-6 items-start">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Bookmarkd
              </h1>
              <p className="text-lg text-white">
                The social network for book lovers.
              </p>
              <p className="text-white mb-4">
                Because life's too short for a book you're not in the mood for.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={goToSignUp}
                  className="bg-primary1 text-white px-6 py-2 rounded shadow hover:bg-accent transition"
                >
                  Sign up
                </button>
                <button
                  onClick={goToSignIn}
                  className="bg-white text-primary2 px-6 py-2 rounded shadow hover:bg-primary1 hover:text-white transition"
                >
                  Sign in
                </button>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img
                src="/images/header.png"
                alt="Hero"
                className="w-80 h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Sign Up Form Slide */}
        <div className="px-4">
          <div className="container mx-auto max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Sign Up</h2>
            <form
              onSubmit={handleSignUp}
              className="bg-white rounded-lg shadow p-6 flex flex-col gap-4"
            >
              {signUpError && (
                <div className="text-red-500 text-sm">
                  {signUpError.message ||
                    "Error creating account. Please try again."}
                </div>
              )}
              <input
                onChange={handleSignUpChange}
                value={signUpState.username}
                name="username"
                type="text"
                placeholder="Username"
                className="border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                required
              />
              <input
                onChange={handleSignUpChange}
                value={signUpState.email}
                name="email"
                type="email"
                placeholder="Email"
                className="border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                required
              />
              <input
                onChange={handleSignUpChange}
                value={signUpState.password}
                name="password"
                type="password"
                placeholder="Password (min 8 characters)"
                className="border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                required
                minLength={8}
              />
              <button
                type="submit"
                className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Sign In Form Slide */}
        <div className="px-4">
          <div className="container mx-auto max-w-xl">
            <h2 className="text-2xl font-bold text-white mb-4">Sign In</h2>
            <form
              onSubmit={handleLogin}
              className="bg-white rounded-lg shadow p-6 flex flex-col gap-4"
            >
              {loginError && (
                <div className="text-red-500 text-sm">
                  {loginError.message || "Invalid email or password"}
                </div>
              )}
              <input
                onChange={handleChange}
                value={formState.email}
                name="email"
                type="email"
                placeholder="Email"
                className="border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                required
              />
              <input
                onChange={handleChange}
                value={formState.password}
                name="password"
                type="password"
                placeholder="Password"
                className="border border-primary1 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary1"
                required
              />
              <button
                type="submit"
                className="bg-primary1 text-white px-6 py-2 rounded hover:bg-accent transition"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </Slider>
    </section>
  );
}
