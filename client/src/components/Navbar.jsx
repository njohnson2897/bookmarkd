import { Link, useLocation } from "react-router-dom";
import Auth from "../utils/auth";


function Navbar() {
  const alertTest = function (e) {
    e.preventDefault();
    document
      .querySelector("#navbarSupportedContent")
      .classList.toggle("lg_nav-toggle");
    document
      .querySelector(".custom_menu-btn")
      .classList.toggle("menu_btn-style");
  };

  const scrollToBottom = () => {
    const bottom = document.getElementById("bottom");
    bottom.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    Auth.logout();
  };

  const currentPage = useLocation().pathname;

  const isLoggedIn = Auth.loggedIn();

  return (
    <div className="hero_area">
      {isLoggedIn ? (
        <>
          {(() => {
            const decodedToken = Auth.getProfile();
            const currentUserId = decodedToken.data._id;
            const currentUserPath = `/profile/${currentUserId}`;

            return (
              <header className="header_section">
                <div className="container-fluid">
                  <nav className="navbar navbar-expand-lg custom_nav-container">
                    <Link className="navbar-brand" to="/">
                      <img src="images/logo.png" alt="" />
                      <span>Bookmarkd\</span>
                    </Link>
                    <button
                      className="navbar-toggler"
                      type="button"
                      data-toggle="collapse"
                      data-target="#navbarSupportedContent"
                      aria-controls="navbarSupportedContent"
                      aria-expanded="false"
                      aria-label="Toggle navigation"
                    >
                      <span className="navbar-toggler-icon"></span>
                    </button>

                    <div
                      className="collapse navbar-collapse"
                      id="navbarSupportedContent"
                    >
                      <ul className="navbar-nav  ">
                        <li className="nav-item active">
                          <Link
                            className="nav-link"
                            onClick={handleLogout}
                            to="/"
                          >
                            Logout
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link
                            className="nav-link"
                            to={currentPage}
                            onClick={scrollToBottom}
                          >
                            Contact Us
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/users">
                            Users
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to={currentUserPath}>
                            My Profile
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/clubs">
                            Book Clubs
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link" to="/reviews">
                            Reviews
                          </Link>
                        </li>
                      </ul>
                      <div className="user_option">
                        <Link className="pr-2" to="/search">
                          Browse Books
                        </Link>
                      </div>
                    </div>
                    <div>
                      <div className="custom_menu-btn ">
                        <button onClick={alertTest}>
                          <span className=" s-1"></span>
                          <span className="s-2"></span>
                          <span className="s-3"></span>
                        </button>
                      </div>
                    </div>
                  </nav>
                </div>
              </header>
            );
          })()}
        </>
      ) : (
        <header className="header_section">
          <div className="container-fluid">
            <nav className="navbar navbar-expand-lg custom_nav-container">
              <Link className="navbar-brand" to="/">
                <img src="images/logo.png" alt="" />
                <span>Bookmarkd\</span>
              </Link>
              <button
                className="navbar-toggler"
                type="button"
                data-toggle="collapse"
                data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div
                className="collapse navbar-collapse"
                id="navbarSupportedContent"
              >
                <ul className="navbar-nav  ">
                  <li className="nav-item active">
                    <Link className="nav-link" to="/">
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={currentPage}
                      onClick={scrollToBottom}
                    >
                      Contact Us
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link className="nav-link" to="/users">
                      Users
                    </Link>
                  </li> */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/">
                      Sign In
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/clubs">
                      Book Clubs
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/reviews">
                      Reviews
                    </Link>
                  </li>
                </ul>
                <div className="user_option">
                  <Link className="pr-2" to="/search">
                    Browse Books
                  </Link>
                </div>
              </div>
              <div>
                <div className="custom_menu-btn">
                  <button onClick={alertTest}>
                    <span className=" s-1"></span>
                    <span className="s-2"></span>
                    <span className="s-3"></span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </header>
      )}
    </div>
  );
}

export default Navbar;
