import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Standard Leaflet Icon Fix for React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const AdminCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cities, setCities] = useState([]);
  const [mapCenter, setMapCenter] = useState([22.3039, 70.8022]); // Default Rajkot or center
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    city: '',
    price_per_day: '',
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    status: 'active',
    image_url: [],
    car_type: 'Sedan',
    seats: 4,
    model_year: new Date().getFullYear(),
    address: '',
    delivery_fee: 150
  });

  const fetchCars = async () => {
    try {
      const { data } = await API.get('/cars');
      setCars(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data } = await API.get('/citypoints/cities');
      setCities(data);
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  useEffect(() => {
    fetchCars();
    fetchCities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Geocode city and move map when city selection changes
  useEffect(() => {
    const focusCityOnMap = async () => {
      if (!formData.city) return;
      setIsLocating(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.city)}&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const newCenter = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setMapCenter(newCenter);
          // If we're adding a new car or don't have a marker, move marker to city center
          if (!editingCar && !markerPosition) {
            // setMarkerPosition(newCenter); // Optional: wait for click
          }
        }
      } catch (err) {
        console.error('Failed to locate city:', err);
      }
      setIsLocating(false);
    };

    focusCityOnMap();
  }, [formData.city, editingCar]);

  const handleMapClick = async (latlng) => {
    setMarkerPosition([latlng.lat, latlng.lng]);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    }
  };

  // Helper components for Leaflet
  const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) map.setView(center, 13);
    }, [center, map]);
    return null;
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        handleMapClick(e.latlng);
      },
    });
    return null;
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadedUrls = [...formData.image_url];

    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'rentify_uploads');
      data.append('folder', 'rentify_test');

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: data }
        );
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error?.message || 'Upload failed');
        }

        const fileData = await res.json();
        uploadedUrls.push(fileData.secure_url);
      } catch (err) {
        console.error('Upload failed:', err);
        alert(`Image upload failed: ${err.message}`);
      }
    }
    
    setFormData({ ...formData, image_url: uploadedUrls });
    setUploading(false);
  };

  const removeImage = (index) => {
    const newImages = formData.image_url.filter((_, i) => i !== index);
    setFormData({ ...formData, image_url: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Please wait for the image to finish uploading');
      return;
    }

    try {
      if (editingCar) {
        await API.put(`/cars/${editingCar.car_id}`, formData);
        alert('Car updated successfully');
      } else {
        await API.post('/cars', formData);
        alert('Car added successfully');
      }
      setShowModal(false);
      setEditingCar(null);
      setFormData({
        name: '', brand: '', city: '', price_per_day: '', fuel_type: 'Petrol',
        transmission: 'Automatic', status: 'active', image_url: [],
        car_type: 'Sedan', seats: 4, model_year: new Date().getFullYear(), address: '',
        delivery_fee: 150
      });
      fetchCars();
    } catch (err) {
      console.error('Operation failed:', err);
      alert(`Operation failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const openEditModal = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      city: car.city || '',
      price_per_day: car.price_per_day,
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      status: car.status,
      image_url: Array.isArray(car.image_url) ? car.image_url : (car.image_url ? [car.image_url] : []),
      car_type: car.car_type || 'Sedan',
      seats: car.seats || 4,
      model_year: car.model_year || new Date().getFullYear(),
      address: car.address || '',
      delivery_fee: car.delivery_fee || 150
    });
    setShowModal(true);
  };

  const deleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    try {
      await API.delete(`/cars/${id}`);
      fetchCars();
      alert('Car deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border"></div></div>;

  return (
    <main className="container-fluid my-5 pt-5 px-md-5">
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark">Fleet Management</h2>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" onClick={() => { setEditingCar(null); setShowModal(true); }}>
              <i className="fas fa-plus me-2"></i>ADD NEW VEHICLE
            </button>
          </div>

          <div className="card border-0 p-4 p-md-5 rounded-4 shadow-sm border border-light">
            <div className="table-responsive">
              <table className="table table-hover align-middle custom-table">
                <thead>
                  <tr>
                    <th className="border-0 text-muted small fw-bold text-uppercase">ID</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Vehicle</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Brand</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Price/Day</th>
                    <th className="border-0 text-muted small fw-bold text-uppercase">Specs</th>
                    {/* Status column removed as per request */}
                    <th className="border-0 text-muted small fw-bold text-uppercase text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.car_id}>
                      <td className="text-muted">#{car.car_id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={(Array.isArray(car.image_url) ? car.image_url[0] : car.image_url) || '/assets/img/car.png'} 
                            alt={car.name} 
                            className="rounded-3 me-3 border" 
                            style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                          />
                          <div>
                            <span className="fw-bold text-dark d-block">{car.name}</span>
                            <span className="text-muted smaller"><i className="fas fa-map-marker-alt me-1 small"></i>{car.city || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td>{car.brand}</td>
                      <td><span className="fw-bold text-primary">Rs. {car.price_per_day}</span></td>
                      <td>
                        <div className="small">
                          <span className="text-muted">{car.fuel_type}</span> &bull; 
                          <span className="text-muted ms-1">{car.transmission}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge rounded-pill px-3 py-2 smaller ${car.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                          {car.status === 'active' ? 'Active' : 'Deactive'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-light btn-sm rounded-circle me-2 border shadow-sm" onClick={() => openEditModal(car)} title="Edit">
                          <i className="fas fa-edit text-primary"></i>
                        </button>
                        <button className="btn btn-light btn-sm rounded-circle border shadow-sm" onClick={() => deleteCar(car.car_id)} title="Delete">
                          <i className="fas fa-trash text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cars.length === 0 && (
                    <tr><td colSpan="7" className="text-center py-5 text-muted">No vehicles in fleet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg animate__animated animate__zoomIn animate__faster">
              <div className="modal-header border-0 p-4">
                <h5 className="modal-title fw-bold text-dark">{editingCar ? 'Update Vehicle' : 'Add New Vehicle'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">VEHICLE NAME</label>
                      <input type="text" className="form-control bg-light border-0 p-2" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">BRAND</label>
                      <input type="text" className="form-control bg-light border-0 p-2" name="brand" value={formData.brand} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">PRICE PER DAY (Rs.)</label>
                      <input type="number" className="form-control bg-light border-0 p-2" name="price_per_day" value={formData.price_per_day} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">CITY</label>
                      <select className="form-select bg-light border-0 p-2" name="city" value={formData.city} onChange={handleInputChange} required>
                        <option value="">Select City</option>
                        {cities.map(c => (
                          <option key={c.city_name} value={c.city_name}>{c.city_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">AVAILABILITY STATUS</label>
                      <select className="form-select bg-light border-0 p-2" name="status" value={formData.status} onChange={handleInputChange}>
                        <option value="active">Active (Visible)</option>
                        <option value="deactive">Deactive (Hidden)</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">FUEL TYPE</label>
                      <select className="form-select bg-light border-0 p-2" name="fuel_type" value={formData.fuel_type} onChange={handleInputChange}>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">TRANSMISSION</label>
                      <select className="form-select bg-light border-0 p-2" name="transmission" value={formData.transmission} onChange={handleInputChange}>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">CAR TYPE</label>
                      <select className="form-select bg-light border-0 p-2" name="car_type" value={formData.car_type} onChange={handleInputChange}>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">SEATS</label>
                      <select className="form-select bg-light border-0 p-2" name="seats" value={formData.seats} onChange={handleInputChange}>
                        <option value="4">4 Seats</option>
                        <option value="6">6 Seats</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">MODEL YEAR</label>
                      <input type="number" className="form-control bg-light border-0 p-2" name="model_year" value={formData.model_year} onChange={handleInputChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">DELIVERY FEE (Custom Location)</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-0">Rs.</span>
                        <input type="number" className="form-control bg-light border-0 p-2" name="delivery_fee" value={formData.delivery_fee} onChange={handleInputChange} required />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-bold text-muted">PERMANENT ADDRESS <span className="text-primary">(within {formData.city || 'selected city'})</span></label>
                      <input 
                        type="text" 
                        className="form-control bg-light border-0 p-2 mb-2" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                        placeholder="Click on the map to set address..." 
                      />
                      
                      <div className="rounded-4 overflow-hidden shadow-sm border" style={{ height: '300px', width: '100%', position: 'relative', zIndex: 1 }}>
                        <MapContainer 
                          center={mapCenter} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                          scrollWheelZoom={true}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapUpdater center={mapCenter} />
                          <MapEvents />
                          {markerPosition && <Marker position={markerPosition} />}
                        </MapContainer>
                        {isLocating && (
                          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-50" style={{ zIndex: 1000 }}>
                            <div className="spinner-border text-primary"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-12 mt-4">
                      <label className="form-label small fw-bold text-muted">VEHICLE IMAGES (MULTIPLE)</label>
                      <div className="p-4 border-2 border-dashed rounded-4 bg-light text-center position-relative mb-2">
                        <div className="row g-2 mb-3">
                          {formData.image_url.map((url, index) => (
                            <div key={index} className="col-3 position-relative">
                              <img src={url} alt="Preview" className="w-100 rounded-3 shadow-sm border" style={{ height: '80px', objectFit: 'cover' }} />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm rounded-circle position-absolute shadow-sm d-flex align-items-center justify-content-center" 
                                style={{
                                  width: '26px', 
                                  height: '26px', 
                                  top: '-10px', 
                                  right: '-10px', 
                                  zIndex: 20, 
                                  padding: 0, 
                                  border: '2px solid white'
                                }} 
                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                title="Remove Image"
                              >
                                <i className="fas fa-times" style={{ fontSize: '12px' }}></i>
                              </button>
                            </div>
                          ))}
                        </div>
                        {uploading ? (
                          <div className="spinner-border text-primary" role="status"></div>
                        ) : (
                          <>
                            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                            <p className="small text-muted mb-0">Drag & Drop or Click to Upload Multiple</p>
                            <input type="file" className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" multiple />
                          </>
                        )}
                      </div>
                      <p className="smaller text-muted">You can upload several images to create a gallery.</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={uploading}>
                    {editingCar ? 'UPDATE VEHICLE' : 'ADD VEHICLE'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminCarsPage;
