import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

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

// Helper: flatten all image URLs from potentially nested arrays
const getAllImages = (imageUrl) => {
  if (!imageUrl) return [];
  if (typeof imageUrl === 'string') return [imageUrl];
  if (Array.isArray(imageUrl)) {
    const results = [];
    for (const item of imageUrl) {
      results.push(...getAllImages(item));
    }
    return results;
  }
  return [];
};

const CarDetailsPage = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const [{ data: carData }, { data: reviewData }] = await Promise.all([
          API.get(`/cars/${id}`),
          API.get(`/reviews/car/${id}`)
        ]);
        setCar(carData);
        setReviews(reviewData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  if (loading) return (
    <div className="container py-5 mt-5 text-center">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-3">Loading vehicle details...</p>
    </div>
  );

  if (!car) return (
    <div className="container py-5 mt-5 text-center">
      <h3 className="text-muted">Vehicle not found</h3>
      <Link to="/cars" className="btn btn-primary mt-3 px-4 rounded-pill">Browse All Cars</Link>
    </div>
  );

  return (
    <main className="container my-5 pt-5">
      <div className="row mt-4">
        {/* Car Image Wrapper */}
        <div className="col-lg-7 mb-4">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
            <img 
              src={getAllImages(car.image_url)[activeImage] || getFirstImage(car.image_url)} 
              alt={car.name} 
              className="w-100 object-fit-cover shadow-sm transition-fade" 
              style={{ maxHeight: '500px', height: '400px', width: '100%' }}
            />
          </div>
          {/* Thumbnails */}
          {(() => {
            const images = getAllImages(car.image_url);
            return images.length > 1 ? (
              <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar">
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className={`rounded-3 border-2 cursor-pointer transition-all ${activeImage === index ? 'border-primary' : 'border-transparent'}`}
                    style={{ width: '80px', height: '60px', flexShrink: 0 }}
                    onClick={() => setActiveImage(index)}
                  >
                    <img src={img} alt={`${car.name} ${index}`} className="w-100 h-100 object-fit-cover rounded-2" />
                  </div>
                ))}
              </div>
            ) : null;
          })()}
        </div>

        {/* Car Details Info */}
        <div className="col-lg-5 mb-4 ps-lg-5">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h1 className="fw-bold text-dark display-6 mb-1">{car.name}</h1>
              <div className="d-flex align-items-center mb-3">
                <span className="text-primary fw-bold fs-5 me-3">{car.brand}</span>
                <span className="text-muted small"><i className="fas fa-map-marker-alt text-danger me-1"></i>{car.city || 'Available Nationwide'}</span>
              </div>
            </div>
            {/* Status badge removed to support multi-date booking */}
            {car.status === 'deactive' && (
              <span className="badge bg-danger px-3 py-2 rounded-pill">Currently Offline</span>
            )}
          </div>

          <div className="mb-4">
            <div className="d-flex align-items-center mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className={`fas fa-star ${star <= (reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0) ? 'text-warning' : 'text-muted'} me-1`}></i>
              ))}
              <span className="ms-2 fw-bold">{reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 'No'} / 5</span>
              <span className="ms-1 text-muted small">({reviews.length} reviews)</span>
            </div>
          </div>

          <div className="mb-4 pt-3 border-top">
            <h3 className="fw-bold text-primary mb-1">Rs. {car.price_per_day}</h3>
            <p className="text-muted small">Daily rental price (includes taxes)</p>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-white shadow-sm">
                <i className="fas fa-gas-pump text-primary mb-2 fs-4"></i>
                <p className="small text-muted mb-0">Fuel Type</p>
                <p className="fw-bold mb-0">{car.fuel_type}</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-white shadow-sm">
                <i className="fas fa-car text-primary mb-2 fs-4"></i>
                <p className="small text-muted mb-0">Car Type</p>
                <p className="fw-bold mb-0">{car.car_type || 'N/A'}</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-white shadow-sm">
                <i className="fas fa-users text-primary mb-2 fs-4"></i>
                <p className="small text-muted mb-0">Capacity</p>
                <p className="fw-bold mb-0">{car.seats || 5} Persons</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 bg-light rounded-4 text-center h-100 border border-white shadow-sm">
                <i className="fas fa-calendar-alt text-primary mb-2 fs-4"></i>
                <p className="small text-muted mb-0">Model Year</p>
                <p className="fw-bold mb-0">{car.model_year || 'N/A'}</p>
              </div>
            </div>
          </div>

          {car.status === 'active' ? (
            <Link to={`/booking?carId=${car.car_id}`} className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-bold shadow-lg animate__animated animate__pulse animate__infinite animate__slow">
              <i className="fas fa-calendar-check me-2"></i>GO TO BOOKING
            </Link>
          ) : (
            <button className="btn btn-secondary btn-lg w-100 py-3 rounded-pill" disabled>
              <i className="fas fa-ban me-2"></i>CURRENTLY UNAVAILABLE
            </button>
          )}

          <div className="mt-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle d-flex align-items-center">
            <i className="fas fa-shield-alt text-primary fs-4 me-3"></i>
            <p className="mb-0 small text-dark fw-medium">All our vehicles are fully insured and regularly maintained for your safety.</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="row mt-5 pt-5">
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold"><i className="fas fa-star text-warning me-2"></i>Customer Reviews</h4>
          </div>
          
          <div className="review-list">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div className="card border-0 bg-white mb-3 p-4 rounded-4 shadow-sm border border-light" key={r.review_id}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center fw-bold me-3" style={{ width: '45px', height: '45px' }}>
                        {r.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{r.user?.name}</h6>
                        <div className="text-warning small">
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </div>
                      </div>
                    </div>
                    <span className="text-muted small">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-muted mb-0 lead fs-6">
                    "{r.comment}"
                  </p>
                  {r.admin_reply && (
                    <div className="mt-3 p-3 bg-light rounded-3 border-start border-4 border-primary">
                      <div className="d-flex align-items-center mb-1">
                        <i className="fas fa-reply text-primary me-2"></i>
                        <span className="fw-bold text-dark small">Rentify Team</span>
                      </div>
                      <p className="text-muted small mb-0">{r.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted bg-light rounded-4">
                <i className="fas fa-comments fa-2x mb-2 opacity-25"></i>
                <p>No reviews for this car yet.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card border-0 p-4 rounded-4 bg-light shadow-sm border border-white h-100">
            <h5 className="fw-bold mb-4">Rental Policies</h5>
            <div className="mb-3 d-flex align-items-start">
              <i className="fas fa-id-card text-primary me-3 mt-1"></i>
              <div>
                <p className="fw-bold mb-0 small">Driving License</p>
                <p className="text-muted small mb-0">Valid national or international DL required.</p>
              </div>
            </div>
            <div className="mb-3 d-flex align-items-start">
              <i className="fas fa-user-check text-primary me-3 mt-1"></i>
              <div>
                <p className="fw-bold mb-0 small">Minimum Age</p>
                <p className="text-muted small mb-0">Driver must be at least 21 years old.</p>
              </div>
            </div>
            <div className="mb-3 d-flex align-items-start">
              <i className="fas fa-gas-pump text-primary me-3 mt-1"></i>
              <div>
                <p className="fw-bold mb-0 small">Fuel Policy</p>
                <p className="text-muted small mb-0">Full to Full. Return with the same level.</p>
              </div>
            </div>
            <div className="mb-0 d-flex align-items-start">
              <i className="fas fa-clock text-primary me-3 mt-1"></i>
              <div>
                <p className="fw-bold mb-0 small">Mileage</p>
                <p className="text-muted small mb-0">Unlimited mileage for bookings over 3 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CarDetailsPage;
