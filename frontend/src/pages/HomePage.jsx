import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

// Helper: extract the first image URL from potentially nested arrays
const getFirstImage = (imageUrl) => {
  if (!imageUrl) return '/assets/img/car.png';
  if (typeof imageUrl === 'string') return imageUrl;
  if (Array.isArray(imageUrl)) {
    for (const item of imageUrl) {
      const result = getFirstImage(item);
      if (result && result !== '/assets/img/car.png') return result;
    }
  }
  return '/assets/img/car.png';
};

const HomePage = () => {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, citiesRes, reviewsRes] = await Promise.all([
          API.get('/cars?status=active'),
          API.get('/citypoints/cities'),
          API.get('/reviews/latest')
        ]);
        setFeaturedCars(carsRes.data.slice(0, 3));
        setCities(citiesRes.data);
        setReviews(reviewsRes.data);
        if (citiesRes.data.length > 0) {
          setSelectedCity(citiesRes.data[0].city_name);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedCity) {
      navigate(`/cars?city=${selectedCity}`);
    }
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section 
        className="hero-section position-relative d-flex align-items-center"
        style={{ 
          background: "url('/assets/img/mainCar.webp') no-repeat center center/cover", 
          height: '75vh', 
          marginTop: '76px' 
        }}
      >
        <div className="overlay"
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            background: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3))' 
          }}
        ></div>

        <div className="container position-relative text-white">
          <div className="row">
            <div className="col-lg-8 animate__animated animate__fadeInLeft">
              <span className="badge bg-primary mb-3 px-3 py-2 rounded-pill fw-bold">AFFORDABLE CAR RENTAL</span>
              <h1 className="display-3 fw-bold mb-4">Drive Your Dream Car Today</h1>
              <p className="lead mb-4 text-white-50">
                Experience the ultimate freedom with our luxury fleet. No paperwork, just drive.
              </p>
              <div className="d-flex gap-3">
                <Link to="/cars" className="btn btn-primary btn-lg px-5 rounded-pill shadow-lg">Book Now</Link>
                <Link to="/about" className="btn btn-outline-light btn-lg px-5 rounded-pill">Learn More</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BOOK WIDGET */}
      <section className="position-relative" style={{ marginTop: '-50px', zIndex: 10 }}>
        <div className="container">
          <div className="bg-white p-3 p-md-4 rounded-4 shadow-lg border border-light mx-auto" style={{ maxWidth: '900px' }}>
            <form onSubmit={handleSearch}>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
                  <label className="form-label text-muted small fw-bold text-uppercase tracking-wider">
                    <i className="fas fa-city text-primary me-2"></i>WHERE DO YOU WANT TO RENT?
                  </label>
                  <select 
                    className="form-select border-0 bg-light p-3 rounded-3 fw-bold shadow-none" 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    {cities.length === 0 ? (
                      <option disabled>Loading cities...</option>
                    ) : (
                      cities.map(c => (
                        <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-lg hover-lift">
                    <i className="fas fa-search me-2"></i>FIND VEHICLE
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-5 bg-white mb-5 mt-5">
        <div className="container py-5 text-center">
          <div className="mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-widest">Why Choose Us</h6>
            <h2 className="display-6 fw-bold">Our Premium Services</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 bg-light rounded-4 hover-lift">
                <div className="mb-4 text-primary">
                  <i className="fas fa-map-marked-alt fa-3x"></i>
                </div>
                <h5 className="fw-bold">GPS Navigation</h5>
                <p className="text-muted small">All cars equipped with latest GPS systems.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 bg-light rounded-4 hover-lift">
                <div className="mb-4 text-primary">
                  <i className="fas fa-gas-pump fa-3x"></i>
                </div>
                <h5 className="fw-bold">Full Tank Info</h5>
                <p className="text-muted small">Transparent fuel policies and options.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0 bg-light rounded-4 hover-lift">
                <div className="mb-4 text-primary">
                  <i className="fas fa-headset fa-3x"></i>
                </div>
                <h5 className="fw-bold">24/7 Support</h5>
                <p className="text-muted small">We are here to help you anytime, anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="py-5 bg-light">
        <div className="container py-5">
          <div className="d-flex justify-content-between align-items-end mb-5">
            <div>
              <h6 className="text-primary fw-bold text-uppercase">Our Fleet</h6>
              <h2 className="display-6 fw-bold">Featured Vehicles</h2>
            </div>
            <Link to="/cars" className="btn btn-outline-primary rounded-pill px-4">
              View All Cars <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>

          <div className="row g-4">
            {loading ? (
              <p>Loading cars...</p>
            ) : (
              featuredCars.map((car) => (
                <div className="col-md-4" key={car.car_id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-modern">
                    <img 
                      src={getFirstImage(car.image_url)} 
                      className="card-img-top" 
                      alt={car.name}
                      style={{ height: '220px', objectFit: 'cover' }}
                    />
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between mb-2">
                        <h5 className="card-title fw-bold">{car.name}</h5>
                        <span className="badge bg-light text-dark border">{car.brand}</span>
                      </div>
                      <p className="text-muted small mb-3">
                        <i className="fas fa-gas-pump me-2"></i>{car.fuel_type} &bull;
                        <i className="fas fa-cog mx-2"></i>{car.transmission}
                      </p>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <span className="h5 fw-bold text-primary">Rs. {car.price_per_day}</span>
                          <span className="text-muted small">/day</span>
                        </div>
                        <Link to={`/cars/${car.car_id}`} className="btn btn-sm btn-primary px-4 rounded-pill">
                          Rent Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      {/* TESTIMONIALS SECTION */}
      {reviews.length > 0 && (
        <section className="py-5 bg-white">
          <div className="container py-5 text-center">
            <div className="mb-5">
              <h6 className="text-primary fw-bold text-uppercase tracking-widest">Testimonials</h6>
              <h2 className="display-6 fw-bold">What Our Customers Say</h2>
            </div>
            <div className="row g-4">
              {reviews.map((r) => (
                <div className="col-md-4" key={r.review_id}>
                  <div className="card h-100 p-4 border-0 bg-light rounded-4 shadow-sm hover-lift text-start">
                    <div className="text-warning mb-3">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </div>
                    <p className="text-muted mb-4 fs-6">"{r.comment}"</p>
                    <div className="d-flex align-items-center mt-auto">
                      <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '40px', height: '40px' }}>
                        {r.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{r.user?.name}</h6>
                        <span className="text-muted smaller">{r.car?.brand} {r.car?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default HomePage;
