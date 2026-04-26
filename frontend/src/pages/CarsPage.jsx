import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/api';
import CarCard from '../components/cars/CarCard';

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    fuelType: '',
    transmission: '',
    maxPrice: '',
    city: searchParams.get('city') || ''
  });
  const [cities, setCities] = useState([]);

  const fetchCars = () => {
    fetchCarsWithFilters(filters);
  };

  useEffect(() => {
    fetchCarsWithFilters({
      ...filters,
      city: searchParams.get('city') || filters.city
    });
    fetchCities();
  }, [searchParams]);

  const fetchCities = async () => {
    try {
      const { data } = await API.get('/citypoints/cities');
      setCities(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleReset = () => {
    const clearedFilters = {
      keyword: '',
      fuelType: '',
      transmission: '',
      maxPrice: '',
      city: ''
    };
    setFilters(clearedFilters);
    // Fetch directly with cleared filters since state update is async
    fetchCarsWithFilters(clearedFilters);
  };

  const fetchCarsWithFilters = async (filterData) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterData.keyword) queryParams.append('keyword', filterData.keyword);
      if (filterData.fuelType) queryParams.append('fuelType', filterData.fuelType);
      if (filterData.transmission) queryParams.append('transmission', filterData.transmission);
      if (filterData.maxPrice) queryParams.append('maxPrice', filterData.maxPrice);
      if (filterData.city) queryParams.append('city', filterData.city);
      queryParams.append('status', 'active');
      
      const { data } = await API.get(`/cars?${queryParams.toString()}`);
      setCars(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cars:', error);
      setLoading(false);
    }
  };

  return (
    <main className="container my-5 pt-5">
      <div className="row mt-4">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light sticky-top" style={{ top: '100px' }}>
            <form onSubmit={handleFilterSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0 text-dark">Filters</h5>
                <button type="button" onClick={handleReset} className="btn btn-sm btn-link text-primary text-decoration-none fw-bold">Reset</button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Search</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-0"><i className="fas fa-search text-muted"></i></span>
                  <input 
                    type="text" 
                    className="form-control bg-light border-0 py-2" 
                    name="keyword" 
                    placeholder="Models or brands..." 
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              {/* Fuel Type */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Fuel Type</label>
                <select 
                  className="form-select form-select-sm bg-light border-0 py-2" 
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {/* Transmission */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Transmission</label>
                <select 
                  className="form-select form-select-sm bg-light border-0 py-2" 
                  name="transmission"
                  value={filters.transmission}
                  onChange={handleFilterChange}
                >
                  <option value="">All Transmissions</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* City Filter */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Location (City)</label>
                <select 
                  className="form-select form-select-sm bg-light border-0 py-2" 
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                  ))}
                </select>
              </div>

              {/* Max Price */}
              <div className="mb-4">
                <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Max Price (Per Day)</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-0 text-muted">Rs.</span>
                  <input 
                    type="number" 
                    className="form-control bg-light border-0 py-2" 
                    name="maxPrice" 
                    placeholder="Any price" 
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2 rounded-pill fw-bold shadow-sm mt-2">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Vehicle Grid */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold text-dark">Available Vehicles <span className="text-muted fs-6 mb-0">({cars.length})</span></h4>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Searching for your perfect ride...</p>
            </div>
          ) : (
            <div className="row g-4">
              {cars.map((car) => (
                <div className="col-md-6 col-xl-4" key={car.car_id}>
                  <CarCard car={car} />
                </div>
              ))}
              
              {cars.length === 0 && (
                <div className="col-12 text-center py-5">
                  <div className="mb-3">
                    <i className="fas fa-search fa-4x text-muted opacity-25"></i>
                  </div>
                  <h5 className="text-muted fw-bold">No vehicles found</h5>
                  <p className="text-muted small">Try adjusting your filters or search keywords.</p>
                  <button onClick={handleReset} className="btn btn-outline-primary btn-sm px-4 rounded-pill mt-2">Clear All Filters</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CarsPage;
