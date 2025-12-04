import { Link, useLocation } from "react-router-dom";
import Auth from "../utils/auth.js";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const currentPage = useLocation().pathname;
  const isLoggedIn = Auth.loggedIn();

  const handleLogout = (e) => {
    e.preventDefault();
    Auth.logout();
  };

  const scrollToBottom = () => {
    const bottom = document.getElementById("bottom");
    if (bottom) {
      bottom.scrollIntoView({ behavior: "smooth" });
    }
  };

  let currentUserPath = "/profile";
  if (isLoggedIn) {
    const decodedToken = Auth.getProfile();
    if (decodedToken && decodedToken.data) {
      currentUserPath = `/profile/${decodedToken.data._id}`;
    }
  }

  return (
    <header className="bg-primary2 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link className="flex items-center gap-2 text-2xl font-bold" to="/">
          <img src="/images/logo.png" alt="Bookmarkd Logo" className="h-10 w-10" />
          <span>Bookmarkd</span>
        </Link>
        <button
          className="md:hidden flex flex-col gap-1 focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-1 w-7 rounded bg-white transition-all ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block h-1 w-7 rounded bg-white transition-all ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block h-1 w-7 rounded bg-white transition-all ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </button>
        <div
          className={`flex-col md:flex md:flex-row md:items-center md:gap-6 absolute md:static top-full left-0 w-full md:w-auto bg-primary2 md:bg-transparent transition-all duration-200 ${
            menuOpen ? "flex" : "hidden"
          }`}
        >
          <ul className="flex flex-col md:flex-row md:gap-6 gap-2 md:items-center text-lg font-medium">
            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    onClick={handleLogout}
                    to="/"
                  >
                    Logout
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    to={currentPage}
                    onClick={scrollToBottom}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary1 transition" to="/users">
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    to={currentUserPath}
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary1 transition" to="/clubs">
                    Book Clubs
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    to="/reviews"
                  >
                    Reviews
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link className="hover:text-primary1 transition" to="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    to={currentPage}
                    onClick={scrollToBottom}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary1 transition" to="/">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary1 transition" to="/clubs">
                    Book Clubs
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-primary1 transition"
                    to="/reviews"
                  >
                    Reviews
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="mt-2 md:mt-0 md:ml-4">
            <Link
              className="px-4 py-2 rounded bg-primary1 text-white hover:bg-accent transition"
              to="/search"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;


