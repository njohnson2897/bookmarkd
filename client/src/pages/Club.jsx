export default function Club() {
  
    return (
      <section className="freelance_section ">
  <div id="accordion">
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-5 offset-md-1">
          <div className="detail-box">
            <div className="heading_container">
              <div className="t-link-box" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <div className="detail-box">
                  <h2>
                    Join A Book Club!
                  </h2>
                </div>
              </div>
            </div>
            <div className="tab_container">
              <div className="t-link-box collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                <div className="detail-box">
                  <h5>
                    Join
                  </h5>
                  <h3>
                    Sci-fi Book Club
                  </h3>
                </div>
              </div>
              <div className="t-link-box collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                <div className="detail-box">
                  <h5>
                    Join
                  </h5>
                  <h3>
                    NYT Best Sellers Book Club
                  </h3>
                </div>
              </div>
              <div className="t-link-box collapsed" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                <div className="detail-box">
                  <h5>
                    Join
                  </h5>
                  <h3>
                    Oprah's Book Club
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="collapse show" id="collapseOne" aria-labelledby="headingOne" data-parent="#accordion">
            <div className="img-box">
              <img src="images/books.jpeg" alt=""/>
            </div>
          </div>
          <div className="collapse" id="collapseTwo" aria-labelledby="headingTwo" data-parent="#accordion">
            <h2>Sign Up Here</h2>

                    <div data-mdb-input-init className="form-outline">
                      <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
                      <label className="form-label" htmlFor="typeEmailX-2">First Name</label>
                    </div>     
                    
                    <div data-mdb-input-init className="form-outline">
                      <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
                      <label className="form-label" htmlFor="typeEmailX-2">Last Name</label>
                    </div>

            <div data-mdb-input-init className="form-outline">
              <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typeEmailX-2">Email</label>
            </div>

            <div data-mdb-input-init className="form-outline">
              <input type="password" id="typePasswordX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typePasswordX-2">Club Name</label>
            </div>

            <button data-mdb-button-init data-mdb-ripple-init className="btn btn-danger btn-sm btn-block" type="submit">Join</button>
          </div>
          <div className="collapse" id="collapseThree" aria-labelledby="headingThree" data-parent="#accordion">
            <h2>Sign Up Here</h2>

            <div data-mdb-input-init className="form-outline">
              <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typeEmailX-2">First Name</label>
            </div>     
            
            <div data-mdb-input-init className="form-outline">
              <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typeEmailX-2">Last Name</label>
            </div>

    <div data-mdb-input-init className="form-outline">
      <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
      <label className="form-label" htmlFor="typeEmailX-2">Email</label>
    </div>

    <div data-mdb-input-init className="form-outline">
      <input type="password" id="typePasswordX-2" className="form-control form-control-sm" />
      <label className="form-label" htmlFor="typePasswordX-2">Club Name</label>
    </div>

    <button data-mdb-button-init data-mdb-ripple-init className="btn btn-danger btn-sm btn-block" type="submit">Join</button>
          </div>
          <div className="collapse" id="collapseFour" aria-labelledby="headingfour" data-parent="#accordion">
            <h2>Sign Up Here</h2>

            <div data-mdb-input-init className="form-outline">
              <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typeEmailX-2">First Name</label>
            </div>     
            
            <div data-mdb-input-init className="form-outline">
              <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
              <label className="form-label" htmlFor="typeEmailX-2">Last Name</label>
            </div>

    <div data-mdb-input-init className="form-outline">
      <input type="email" id="typeEmailX-2" className="form-control form-control-sm" />
      <label className="form-label" htmlFor="typeEmailX-2">Email</label>
    </div>

    <div data-mdb-input-init className="form-outline">
      <input type="password" id="typePasswordX-2" className="form-control form-control-sm" />
      <label className="form-label" htmlFor="typePasswordX-2">Club Name</label>
    </div>

    <button data-mdb-button-init data-mdb-ripple-init className="btn btn-danger btn-sm btn-block" type="submit">Join</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    );
  }