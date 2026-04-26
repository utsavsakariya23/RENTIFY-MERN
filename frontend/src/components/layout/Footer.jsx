import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom mt-auto py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="text-dark mb-3 fw-bold">RENTIFY</h5>
            <p className="text-muted">
              Experience the freedom of the road with our premium fleet. Reliable,
              affordable, and always ready for your next adventure.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-primary fs-5"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-primary fs-5"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-primary fs-5"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
          <div className="col-md-2">
            <h6 className="text-dark mb-3 fw-bold">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-muted text-decoration-none hover-primary">Home</Link></li>
              <li className="mb-2"><Link to="/cars" className="text-muted text-decoration-none hover-primary">Vehicles</Link></li>
              <li className="mb-2"><Link to="/about" className="text-muted text-decoration-none hover-primary">About Us</Link></li>
              <li className="mb-2"><Link to="/contact" className="text-muted text-decoration-none hover-primary">Contact</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-dark mb-3 fw-bold">Support</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Help Center</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Terms of Service</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="text-muted text-decoration-none">FAQs</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="text-dark mb-3 fw-bold">Contact Us</h6>
            <p className="text-muted mb-2"><i className="fas fa-envelope me-2 text-primary"></i> rentify@gmail.com</p>
            <p className="text-muted mb-2"><i className="fas fa-phone me-2 text-primary"></i> +91 11 234 5678</p>
            <p className="text-muted"><i className="fas fa-map-marker-alt me-2 text-primary"></i> Rajkot, Gujarat</p>
          </div>
        </div>
        <hr className="my-4 border-secondary opacity-25" />
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} RENTIFY. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <img 
              src="/assets/img/payment_methods.png" 
              alt="Payments"
              className="img-fluid"
              style={{ height: '30px', opacity: 0.6 }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
