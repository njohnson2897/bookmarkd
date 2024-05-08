function Navbar() {
    const alertTest = function(e){
        e.preventDefault();
        document.querySelector("#navbarSupportedContent").classList.toggle("lg_nav-toggle");
        document.querySelector(".custom_menu-btn").classList.toggle("menu_btn-style")
    }
    return (
    <div className="hero_area">
    <header className="header_section">
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg custom_nav-container">
          <a className="navbar-brand" href="/">
            <img src="images/logo.png" alt="" />
            <span>
              Bookmarkd\
            </span>
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav  ">
              <li className="nav-item active">
                <a className="nav-link" href="index.html">Home<span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#bottom">Contact Us</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="users.html">Users</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="bookclubs.html">Book Clubs</a>
              </li>
            </ul>
            <div className="user_option">
              <a href="books.html">
                <span>
                  Browse Books
                </span>
              </a>
              <form className="form-inline my-2 my-lg-0 ml-0 ml-lg-4 mb-3 mb-lg-0">
                <button className="btn  my-2 my-sm-0 nav_search-btn" type="submit"></button>
              </form>
            </div>
          </div>
          <div>
            <div className="custom_menu-btn ">
              <button onClick = {alertTest}>
                <span className=" s-1">

                </span>
                <span className="s-2">

                </span>
                <span className="s-3">

                </span>
              </button>
            </div>
          </div>
          </nav>
      </div>
      </header>
      </div>
    );
}

export default Navbar;