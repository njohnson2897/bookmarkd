import Auth from "../utils/auth.js";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, ADD_USER } from "../utils/mutations.js";

export default function Home() {
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [signUpState, setSignUpState] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [login, { error: loginError }] = useMutation(LOGIN_USER);
  const [addUser, { error: signUpError }] = useMutation(ADD_USER);

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
    <section className="bg-gradient-to-r from-primary2 to-primary1 min-h-[60vh] flex flex-col justify-center py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
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
            <a
              href="#signup"
              className="bg-primary1 text-white px-6 py-2 rounded shadow hover:bg-accent transition"
            >
              Sign up
            </a>
            <a
              href="#signin"
              className="bg-white text-primary2 px-6 py-2 rounded shadow hover:bg-primary1 hover:text-white transition"
            >
              Sign in
            </a>
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
      {/* Sign In Form */}
      <div id="signin" className="container mx-auto px-4 mt-16 max-w-xl">
        <h2 className="text-2xl font-bold text-primary2 mb-4">Sign In</h2>
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
      {/* Sign Up Form */}
      <div id="signup" className="container mx-auto px-4 mt-16 max-w-xl">
        <h2 className="text-2xl font-bold text-primary2 mb-4">Sign Up</h2>
        <form
          onSubmit={handleSignUp}
          className="bg-white rounded-lg shadow p-6 flex flex-col gap-4"
        >
          {signUpError && (
            <div className="text-red-500 text-sm">
              {signUpError.message || "Error creating account. Please try again."}
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
    </section>
  );
}

