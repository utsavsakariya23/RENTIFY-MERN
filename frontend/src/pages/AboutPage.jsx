import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <main style={{ marginTop: '76px' }}>
      {/* Hero Section */}
      <section
        className="position-relative py-5 text-white"
        style={{ background: 'linear-gradient(135deg, #0a58ca, #0d6efd)' }}
      >
        <div className="container py-5 text-center">
          <span className="badge bg-white text-primary px-3 py-2 rounded-pill fw-bold mb-3">Our Story</span>
          <h1 className="display-4 fw-bold mb-3">About Rentify</h1>
          <p className="lead mb-0 opacity-75">
            Redefining mobility with premium vehicles and exceptional service since 2020.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <img
                src="/assets/img/mainCar.webp"
                className="img-fluid rounded-4 shadow-lg w-100"
                alt="About Rentify"
                style={{ objectFit: 'cover', maxHeight: '400px' }}
              />
            </div>
            <div className="col-lg-6">
              <h6 className="text-primary fw-bold text-uppercase">Who We Are</h6>
              <h2 className="fw-bold mb-4">Driving Your Dreams Forward</h2>
              <p className="text-muted mb-4">
                At Rentify, we believe that the journey is just as important as the destination.
                We started with a simple mission: to make car rental effortless, transparent, and
                enjoyable for everyone across India.
              </p>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary bg-opacity-10 rounded-3 p-3 me-3 flex-shrink-0">
                      <i className="fas fa-check-circle text-primary fa-lg"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Reliable Fleet</h6>
                      <p className="small text-muted mb-0">Rigorous maintenance checks for your safety.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="bg-warning bg-opacity-10 rounded-3 p-3 me-3 flex-shrink-0">
                      <i className="fas fa-star text-warning fa-lg"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Top Rated</h6>
                      <p className="small text-muted mb-0">Consistently rated 4.9/5 by our customers.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="bg-success bg-opacity-10 rounded-3 p-3 me-3 flex-shrink-0">
                      <i className="fas fa-shield-alt text-success fa-lg"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">Fully Insured</h6>
                      <p className="small text-muted mb-0">All vehicles have comprehensive insurance.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="bg-info bg-opacity-10 rounded-3 p-3 me-3 flex-shrink-0">
                      <i className="fas fa-headset text-info fa-lg"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">24/7 Support</h6>
                      <p className="small text-muted mb-0">We're here to help anytime, anywhere.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
        <div className="container">
          <div className="row g-4 text-center text-white">
            {[
              { value: '500+', label: 'Premium Vehicles', icon: 'fas fa-car' },
              { value: '10k+', label: 'Happy Customers', icon: 'fas fa-users' },
              { value: '50+', label: 'Locations', icon: 'fas fa-map-marker-alt' },
              { value: '24/7', label: 'Customer Support', icon: 'fas fa-headset' },
            ].map((stat) => (
              <div className="col-md-3 col-6" key={stat.label}>
                <div className="p-3">
                  <i className={`${stat.icon} fa-2x mb-3 opacity-75`}></i>
                  <h2 className="fw-bold display-5">{stat.value}</h2>
                  <p className="mb-0 opacity-75">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase">Our Vision</h6>
            <h2 className="fw-bold display-6">The Future of Mobility</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              We are constantly innovating to bring you the best travel experience. From electric vehicles
              to seamless app-based bookings, we are building the future of car rental.
            </p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'fas fa-leaf', color: 'text-success', bg: 'bg-success', title: 'Eco-Friendly', desc: 'Expanding our fleet with hybrid and electric vehicles to reduce carbon footprint.' },
              { icon: 'fas fa-mobile-alt', color: 'text-primary', bg: 'bg-primary', title: 'Digital First', desc: 'A completely paperless, digital booking experience for your convenience.' },
              { icon: 'fas fa-globe', color: 'text-info', bg: 'bg-info', title: 'National Reach', desc: 'Growing our network to serve you in more cities across India.' },
            ].map((card) => (
              <div className="col-md-4" key={card.title}>
                <div className="card border-0 text-center p-4 h-100 shadow-sm rounded-4">
                  <div className={`${card.bg} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4`} style={{ width: '80px', height: '80px' }}>
                    <i className={`${card.icon} fa-2x ${card.color}`}></i>
                  </div>
                  <h5 className="fw-bold">{card.title}</h5>
                  <p className="text-muted small">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-white">
        <div className="container text-center py-4">
          <h2 className="fw-bold mb-3">Ready to Hit the Road?</h2>
          <p className="text-muted mb-4">Browse our fleet and book your dream car today.</p>
          <Link to="/cars" className="btn btn-primary btn-lg px-5 rounded-pill shadow">
            <i className="fas fa-car me-2"></i>Explore Our Fleet
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
