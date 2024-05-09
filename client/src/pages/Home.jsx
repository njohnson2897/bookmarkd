export default function Home() {
  
    return (
      <section className="slider_section ">
      <div className="carousel_btn-container">
        <a className="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
          <span className="sr-only">Previous</span>
        </a>
        <a className="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
          <span className="sr-only">Next</span>
        </a>
      </div>
      <div id="carouselExampleIndicators" className="carousel slide" data-ride="carousel">
        <ol className="carousel-indicators">
          <li data-target="#carouselExampleIndicators" data-slide-to="0" className="active">01</li>
          <li data-target="#carouselExampleIndicators" data-slide-to="1">02</li>
          <li data-target="#carouselExampleIndicators" data-slide-to="2">03</li>
        </ol>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-5 offset-md-1">
                  <div className="detail-box">
                    <h1>
                      Bookmarkd
                    </h1>
                    <p>The social network for book lovers.</p>
                    <p>
                      Because life's too short for a book you're not in the mood for.
                    </p>
                    <div className="btn-box">
                      <a href="#carouselExampleIndicators" data-target="#carouselExampleIndicators" data-slide-to="2" className="btn-1">
                        Sign up
                      </a>
                      <a href="#carouselExampleIndicators" data-target="#carouselExampleIndicators" data-slide-to="1" className="btn-2">
                        Sign in
                      </a>
                    </div>
                  </div>
                </div>
                <div className="offset-md-1 col-md-4 img-container">
                  <div className="img-box">
                    <img src="images/header.png" alt=""/>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item ">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-5 offset-md-1">
                  <div className="detail-box">
                    <h1>
                      Bookmarkd
                    </h1>
                    <p>The social network for book lovers.</p>
                    <p>
                      Because life's too short for a book you're not in the mood for.
                    </p>
                  </div>
                </div>
                <div className="offset-md-1 col-md-4 img-container">
                  <div className="img-box">
                    <h1 className="mb-5">Sign in</h1>
            <div data-mdb-input-init className="form-outline mb-4">
              <input type="email" id="typeEmailX-2" className="form-control form-control-lg" />
              <label className="form-label" htmlFor="typeEmailX-2">Email</label>
            </div>

            <div data-mdb-input-init className="form-outline mb-4">
              <input type="password" id="typePasswordX-2" className="form-control form-control-lg" />
              <label className="form-label" htmlFor="typePasswordX-2">Password</label>
            </div>

            <div className="form-check d-flex justify-content-start mb-4">
              <input className="form-check-input" type="checkbox" value="" id="form1Example3" />
              <label className="form-check-label" htmlFor="form1Example3"> Remember password </label>
            </div>

            <button data-mdb-button-init data-mdb-ripple-init className="btn btn-danger btn-lg btn-block" type="submit">Sign in</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item ">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-5 offset-md-1">
                  <div className="detail-box">
                    <h1>
                     Bookmarkd
                    </h1>
                    <p>The social network for book lovers.</p>
                    <p>
                      Because life's too short for a book you're not in the mood for.
                    </p>
                  </div>
                </div>
                <div className="offset-md-1 col-md-4 img-container">
                  <div className="img-box">
                    <h1 className="mb-5">Sign up</h1>

                    <div data-mdb-input-init className="form-outline mb-4">
                      <input type="email" id="typeEmailX-2" className="form-control form-control-lg" />
                      <label className="form-label" htmlFor="typeEmailX-2">First Name</label>
                    </div>     
                    
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input type="email" id="typeEmailX-2" className="form-control form-control-lg" />
                      <label className="form-label" htmlFor="typeEmailX-2">Last Name</label>
                    </div>

            <div data-mdb-input-init className="form-outline mb-4">
              <input type="email" id="typeEmailX-2" className="form-control form-control-lg" />
              <label className="form-label" htmlFor="typeEmailX-2">Email</label>
            </div>

            <div data-mdb-input-init className="form-outline mb-4">
              <input type="password" id="typePasswordX-2" className="form-control form-control-lg" />
              <label className="form-label" htmlFor="typePasswordX-2">Password</label>
            </div>

            <button data-mdb-button-init data-mdb-ripple-init className="btn btn-danger btn-lg btn-block" type="submit">Sign up</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
 
<section className="client_section layout_padding">
    <div className="container">
      <div className="row">
        <div className="col-lg-9 col-md-10 mx-auto">
          <div className="heading_container">
            <h2>
              Featured Users
            </h2>
          </div>
          <div id="carouselExampleControls" className="carousel slide" data-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="detail-box">
                  <h4>
                    User #1 Book Review
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt=""/>
                </div>
              </div>
              <div className="carousel-item">
                <div className="detail-box">
                  <h4>
                    User #2 Book Review
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt=""/>
                </div>
              </div>
              <div className="carousel-item">
                <div className="detail-box">
                  <h4>
                    #3 Book Review
                  </h4>
                  <p>
                    passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If youThere are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in s
                  </p>
                  <img src="images/quote.png" alt=""/>
                </div>
              </div>
            </div>
            <a className="carousel-control-prev" href="#carouselExampleControls" role="button" data-slide="prev">
              <span className="sr-only">Previous</span>
            </a>
            <a className="carousel-control-next" href="#carouselExampleControls" role="button" data-slide="next">
              <span className="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
    </section>
    );
  }