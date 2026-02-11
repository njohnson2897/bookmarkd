import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer id="bottom" className="bg-primary2 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 mb-2">
              <img
                src="/images/logo.png"
                alt="Bookmarkd Logo"
                className="h-10 w-10"
              />
              <span className="text-2xl font-bold">Bookmarkd</span>
            </div>
            <span className="text-sm">Enjoying the App?</span>
            <span className="text-sm mb-2">Share On Social Media!</span>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img
                  src="/images/fb.png"
                  alt="facebook logo"
                  className="h-7 w-7 hover:scale-110 transition"
                />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <img
                  src="/images/twitter.png"
                  alt="twitter logo"
                  className="h-7 w-7 hover:scale-110 transition"
                />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <img
                  src="/images/linkedin.png"
                  alt="linkedin logo"
                  className="h-7 w-7 hover:scale-110 transition"
                />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img
                  src="/images/instagram.png"
                  alt="instagram logo"
                  className="h-7 w-7 hover:scale-110 transition"
                />
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
            <h5 className="font-bold text-lg mb-2">Links</h5>
            <Link className="hover:text-primary1 transition" to="/">
              Home
            </Link>
            <Link className="hover:text-primary1 transition" to="/search">
              Browse Books
            </Link>
            <Link className="hover:text-primary1 transition" to="/clubs">
              Book Clubs
            </Link>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
            <h5 className="font-bold text-lg mb-2">About Bookmarkd</h5>
            <p className="max-w-xs text-sm">
              The perfect place to read & write book reviews, curate
              personalized book lists, and join book clubs!
            </p>
            <div className="flex items-center gap-2 mt-2">
              <a
                href="https://github.com/njohnson2897/bookmarkd"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary1 transition"
              >
                <img
                  src="/images/gh.png"
                  alt="github logo"
                  className="h-6 w-6"
                />
                Github
              </a>
            </div>
            <h6 className="text-xs mt-2">
              Alexa Aguinada, Domas Dargis, Nate Johnson, & Robin Langton
            </h6>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start w-full md:w-1/4">
            <h5 className="font-bold text-lg mb-2">Contact Us</h5>
            <p className="text-sm mb-2">
              Have a question or feedback? We'd love to hear from you!
            </p>
            <Link
              to="/contact"
              className="bg-primary1 text-white rounded px-4 py-2 hover:bg-accent transition text-center"
            >
              Send us a Message
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

