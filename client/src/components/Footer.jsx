import { Link } from 'react-router-dom';

function Footer() {
    return (
        <section className="info_section ">
    <div className="info_container layout_padding-top">
      <div className="container">
        <div className="info_top">
          <div className="info_logo">
            <img src="images/logo.png" alt="" />
            <span>
              Bookmarkd\
            </span>
          </div>
          <span>Enjoying the App?</span>
          <span>Share On Social Media!</span>
          <div className="social_box">
            <a href="https://www.facebook.com/" target="_blank">
              <img src="images/fb.png" alt="facebook logo"/>
            </a>
            <a href="https://twitter.com/" target="_blank">
              <img src="images/twitter.png" alt="twitter logo"/>
            </a>
            <a href="https://www.linkedin.com/" target="_blank">
              <img src="images/linkedin.png" alt="linkedin logo"/>
            </a>
            <a href="https://www.instagram.com/" target="_blank">
              <img src="images/instagram.png" alt="instagram logo"/>
            </a>
          </div>
        </div>

        <div className="info_main">
          <div className="row">
            <div className="col-md-3 col-lg-2">
              <div className="info_link-box">
                <h5>
                  Links
                </h5>
                <ul>
                  <li className="active">
                  <Link className='nav-link' to='/'>Home</Link>
                  </li>
                  <li className="">
                  <Link className='pr-2' to='/search'>Browse Books</Link>
                  </li>
                  <li className="">
                  <Link className='nav-link' to='/clubs'>Book Clubs</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-md-3 ">
              <h5>
                About Bookmarkd
              </h5>
              <p>
                The perfect place to read & write book reviews, curate personalized book lists, and join book clubs!
              </p>
            </div>

            <div className="col-md-3 col-lg-2 offset-lg-1">
              <h5>
                <div className="social_box">
                  <a href="https://github.com/njohnson2897/bookmarkd" target="blank">
                    <img src="images/gh.png" alt="githublogo"/>Github
                  </a>
                  </div>
              </h5>
              <h6>Alexa Aguinada, Domas Dar, Nate Johnson, & Robin Langton</h6>
            </div>

            <div className="col-md-3  offset-lg-1">
              <div className="info_form ">
                <h5>
                  Contact Us
                </h5>

                {/* Changed from class= to className */}
                <div className="form" id='bottom'>
                  <form>
                      <div className="form-group">
                        {/* Changed from emailarea to textarea*/}
                          <textarea type="email" className="form-control form-control-sm" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Email" required></textarea>    

                          <textarea name="contact-message" id="contact-message" cols="30" rows="2" className="form-control form-control-sm" placeholder="Message"></textarea>
                      <button type="submit" className="btn btn-primary btn-block btn-sm mt-3">Send Message</button>
                    </div>
                  </form>
              </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
    );
}

export default Footer;
