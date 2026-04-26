import React from 'react';
import { Link } from 'react-router-dom';

const CarCard = ({ car }) => {
  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-modern">
      <div className="position-relative">
        <img 
          src={(Array.isArray(car.image_url) ? car.image_url[0] : car.image_url) || '/assets/img/car.png'} 
          className="card-img-top" 
          alt={car.name}
          style={{ height: '220px', objectFit: 'cover' }}
        />
        <div className="position-absolute bottom-0 end-0 bg-white p-2 rounded-start-4 shadow-sm fw-bold small text-primary">
          <i className="fas fa-map-marker-alt me-1 text-danger"></i>{car.city || 'N/A'}
        </div>
      </div>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between mb-2">
          <h5 className="card-title fw-bold text-dark mb-0">{car.name}</h5>
          <span className="badge bg-light text-primary border border-primary-subtle px-2 py-1">{car.brand}</span>
        </div>
        <div className="row g-2 mb-3">
          <div className="col-4">
            <small className="text-muted"><i className="fas fa-gas-pump me-1 text-primary"></i>{car.fuel_type}</small>
          </div>
          <div className="col-4 text-center">
            <small className="text-muted"><i className="fas fa-users me-1 text-primary"></i>{car.seats}S</small>
          </div>
          <div className="col-4 text-end">
            <small className="text-muted"><i className="fas fa-car me-1 text-primary"></i>{car.car_type?.charAt(0)}</small>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <div>
            <span className="fs-4 fw-bold text-primary">Rs. {car.price_per_day}</span>
            <span className="text-muted small"> /day</span>
          </div>
          <Link to={`/cars/${car.car_id}`} className="btn btn-primary btn-sm px-4 rounded-pill fw-bold shadow-sm">
            Rent Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
