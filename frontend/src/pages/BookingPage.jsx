import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const carId = searchParams.get('carId');
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropLocation: '',
    paymentMethod: 'Cash',
    isPermanentLocation: false
  });
  const [sameAsPickup, setSameAsPickup] = useState(false);
  const [priceSummary, setPriceSummary] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState({ percent: 0, code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });
  const [locatingField, setLocatingField] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null); // for modal
  const [suggestedCoupons, setSuggestedCoupons] = useState([]);

  useEffect(() => {
    API.get('/bookings/coupons/suggestions')
      .then(res => setSuggestedCoupons(res.data))
      .catch(err => console.log('Coupons not loaded'));
  }, []);

  useEffect(() => {
    if (!carId) { navigate('/cars'); return; }
    const fetchCar = async () => {
      try {
        const { data } = await API.get(`/cars/${carId}`);
        setCar(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load car details');
        setLoading(false);
      }
    };
    fetchCar();
  }, [carId, navigate]);

  useEffect(() => {
    if (sameAsPickup && !bookingData.isPermanentLocation) {
      setBookingData(prev => ({ ...prev, dropLocation: prev.pickupLocation }));
    }
  }, [sameAsPickup, bookingData.pickupLocation, bookingData.isPermanentLocation]);

  useEffect(() => {
    if (bookingData.isPermanentLocation && car) {
      setBookingData(prev => ({
        ...prev,
        pickupLocation: car.address || 'Car Permanent Location',
        dropLocation: car.address || 'Car Permanent Location'
      }));
    }
  }, [bookingData.isPermanentLocation, car]);

  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      if (end >= start) {
        const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
        const subtotal = diffDays * car.price_per_day;
        const deliveryFee = bookingData.isPermanentLocation ? 0 : (parseFloat(car.delivery_fee) || 0);
        const discount = (subtotal * discountInfo.percent) / 100;
        const total = subtotal + deliveryFee - discount;
        setPriceSummary({ days: diffDays, subtotal, deliveryFee, discount, total });
      } else {
        setPriceSummary(null);
      }
    }
  }, [bookingData.startDate, bookingData.endDate, bookingData.isPermanentLocation, car, discountInfo]);

  const handleUseCurrentLocation = (field) => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setLocatingField(field);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data?.display_name) {
          setBookingData(prev => ({ ...prev, [field === 'pickup' ? 'pickupLocation' : 'dropLocation']: data.display_name }));
        }
      } catch (err) { alert('Failed to get address'); }
      setLocatingField(null);
    }, () => { alert('Location access denied.'); setLocatingField(null); });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData({ ...bookingData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponMessage({ type: '', text: '' });
    try {
      const { data } = await API.post('/bookings/validate-coupon', { code: couponCode });
      setDiscountInfo({ percent: data.discount_percent, code: data.code });
      setCouponMessage({ type: 'success', text: `Coupon applied! You saved ${data.discount_percent}%` });
    } catch (err) {
      setCouponMessage({ type: 'danger', text: err.response?.data?.message || 'Invalid coupon' });
      setDiscountInfo({ percent: 0, code: '' });
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (bookingId, amount, pendingBooking) => {
    const loaded = await loadRazorpay();
    if (!loaded) { 
      setError('Payment gateway failed to load.'); 
      // Cancel the booking since payment can't proceed
      try { await API.put(`/bookings/${bookingId}/cancel`); } catch(e) {}
      return; 
    }
    try {
      const { data: order } = await API.post('/payment/create-order', {
        amount: Math.round(amount * 100),
        bookingId
      });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Rentify',
        description: `Booking #${bookingId} — ${car.brand} ${car.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await API.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            });
            setConfirmedBooking({ ...pendingBooking, payment_status: 'Paid', booking_status: 'Confirmed', transaction_id: response.razorpay_payment_id });
          } catch (err) { 
            setError('Payment verification failed. Please contact support.'); 
            try { await API.put(`/bookings/${bookingId}/cancel`); } catch(e) {}
          }
        },
        prefill: { name: userInfo?.name, email: userInfo?.email },
        theme: { color: '#0d6efd' },
        modal: { 
          ondismiss: async () => {
            setError('Payment was cancelled. Booking has been cancelled.');
            try { await API.put(`/bookings/${bookingId}/cancel`); } catch(e) {}
          } 
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response){
        setError('Payment failed. Booking has been cancelled.');
        try { await API.put(`/bookings/${bookingId}/cancel`); } catch(e) {}
      });
      rzp.open();
    } catch (err) { 
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment.'); 
      try { await API.put(`/bookings/${bookingId}/cancel`); } catch(e) {}
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) { navigate('/login', { state: { from: { pathname: `/booking?carId=${carId}` } } }); return; }
    setSubmitting(true);
    setError('');
    try {
      const { data } = await API.post('/bookings', {
        car_id: carId,
        start_date: bookingData.startDate,
        end_date: bookingData.endDate,
        total_days: priceSummary.days,
        pickup_location: bookingData.pickupLocation,
        drop_location: bookingData.dropLocation,
        is_permanent_location: bookingData.isPermanentLocation,
        delivery_fee: priceSummary.deliveryFee,
        total_price: priceSummary.subtotal,
        discount_amount: priceSummary.discount,
        final_price: priceSummary.total,
        coupon_code: discountInfo.code,
        payment_method: bookingData.paymentMethod
      });

      const newBooking = { ...data, car, payment_method: bookingData.paymentMethod };
      
      // For online payment, trigger Razorpay. Modal opens AFTER payment finishes/fails.
      if (bookingData.paymentMethod === 'Online') {
        handleRazorpayPayment(data.booking_id, priceSummary.total, newBooking);
      } else {
        setConfirmedBooking(newBooking);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container py-5 mt-5 text-center"><div className="spinner-border text-primary" role="status"></div><p className="mt-3 text-muted">Loading vehicle details...</p></div>;

  return (
    <main className="container my-5 pt-5">
      <div className="row justify-content-center mt-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div className="card-body p-4 p-md-5">
              <h3 className="fw-bold mb-4 text-dark">
                <i className="fas fa-calendar-check text-primary me-3"></i>Confirm Your Booking
              </h3>

              {error && <div className="alert alert-danger mb-4 rounded-3"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

              {car && (
                <div className="d-flex align-items-center mb-5 p-3 rounded-4 bg-light border border-white shadow-sm">
                  <img
                    src={(Array.isArray(car.image_url) ? car.image_url[0] : car.image_url) || '/assets/img/car.png'}
                    alt={car.name}
                    className="rounded-3 shadow-sm"
                    style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                  />
                  <div className="ms-4">
                    <h5 className="fw-bold mb-1">{car.name}</h5>
                    <p className="text-muted small mb-1">{car.brand} &bull; {car.transmission} &bull; {car.fuel_type}</p>
                    <span className="text-primary fw-bold fs-5">Rs. {car.price_per_day} <span className="text-muted small fw-normal">/day</span></span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Pickup Date</label>
                    <input type="date" className="form-control bg-light border-0 p-3 rounded-3" name="startDate" required min={new Date().toISOString().split('T')[0]} value={bookingData.startDate} onChange={handleInputChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Return Date</label>
                    <input type="date" className="form-control bg-light border-0 p-3 rounded-3" name="endDate" required min={bookingData.startDate || new Date().toISOString().split('T')[0]} value={bookingData.endDate} onChange={handleInputChange} />
                  </div>

                  <div className="col-12">
                    <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle d-flex align-items-center mb-2">
                      <i className="fas fa-map-marker-alt text-primary fs-4 me-3"></i>
                      <div>
                        <label className="form-label small fw-bold text-muted text-uppercase mb-0">Car Registered City</label>
                        <p className="fw-bold mb-0 text-dark">{car?.city || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch custom-switch p-3 border rounded-3 bg-light">
                      <input className="form-check-input ms-0 me-3" type="checkbox" name="isPermanentLocation" id="isPermanentLocation" checked={bookingData.isPermanentLocation} onChange={handleInputChange} />
                      <label className="form-check-label fw-bold text-dark" htmlFor="isPermanentLocation">
                        <i className="fas fa-home text-primary me-2"></i>Delivery &amp; Pick-up from Car Permanent Location (No Extra Charge)
                      </label>
                      <p className="small text-muted mb-0 ms-5">{car?.address || 'Car will be at its primary park location.'}</p>
                    </div>
                  </div>

                  {!bookingData.isPermanentLocation && (
                    <>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted text-uppercase">Pickup Address</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0"><i className="fas fa-map-pin text-primary"></i></span>
                          <input type="text" className="form-control bg-light border-0 p-3" name="pickupLocation" placeholder="Enter detailed pickup address" required value={bookingData.pickupLocation} onChange={handleInputChange} />
                          <button className="btn btn-light border-start border-white px-3" type="button" onClick={() => handleUseCurrentLocation('pickup')} disabled={locatingField === 'pickup'} title="Use Current Location">
                            {locatingField === 'pickup' ? <span className="spinner-border spinner-border-sm text-primary"></span> : <i className="fas fa-location-crosshairs text-primary"></i>}
                          </button>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-bold text-muted text-uppercase mb-0">Return Address</label>
                          <div className="form-check form-check-inline mb-0">
                            <input className="form-check-input" type="checkbox" id="sameAsPickup" checked={sameAsPickup} onChange={(e) => setSameAsPickup(e.target.checked)} />
                            <label className="form-check-label small fw-bold text-muted" htmlFor="sameAsPickup">Same as pickup</label>
                          </div>
                        </div>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-0"><i className="fas fa-undo text-primary"></i></span>
                          <input type="text" className="form-control bg-light border-0 p-3" name="dropLocation" placeholder="Enter detailed return address" required={!sameAsPickup} disabled={sameAsPickup} value={sameAsPickup ? bookingData.pickupLocation : bookingData.dropLocation} onChange={handleInputChange} />
                          {!sameAsPickup && (
                            <button className="btn btn-light border-start border-white px-3" type="button" onClick={() => handleUseCurrentLocation('drop')} disabled={locatingField === 'drop'}>
                              {locatingField === 'drop' ? <span className="spinner-border spinner-border-sm text-primary"></span> : <i className="fas fa-location-crosshairs text-primary"></i>}
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment Method */}
                  <div className="col-12 mt-4">
                    <label className="form-label small fw-bold text-muted text-uppercase d-block mb-3">Payment Method</label>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={`d-flex align-items-center gap-3 p-3 rounded-3 border cursor-pointer ${bookingData.paymentMethod === 'Cash' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="paymentMethod" value="Cash" checked={bookingData.paymentMethod === 'Cash'} onChange={handleInputChange} />
                          <i className="fas fa-money-bill-wave text-success fs-5"></i>
                          <div>
                            <div className="fw-bold">Cash on Pickup</div>
                            <div className="text-muted small">Pay when you collect the car</div>
                          </div>
                        </label>
                      </div>
                      <div className="col-md-6">
                        <label className={`d-flex align-items-center gap-3 p-3 rounded-3 border cursor-pointer ${bookingData.paymentMethod === 'Online' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="paymentMethod" value="Online" checked={bookingData.paymentMethod === 'Online'} onChange={handleInputChange} />
                          <i className="fas fa-credit-card text-primary fs-5"></i>
                          <div>
                            <div className="fw-bold">Online Payment</div>
                            <div className="text-muted small">Pay securely via Razorpay</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Coupon */}
                  <div className="col-12 mt-4 pt-3 border-top">
                    <label className="form-label small fw-bold text-muted text-uppercase d-block mb-3">Apply Coupon</label>
                    <div className="input-group">
                      <input type="text" className="form-control bg-light border-0 p-3 rounded-start-3" placeholder="ENTER COUPON CODE" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                      <button className="btn btn-primary px-4 fw-bold rounded-end-3" type="button" onClick={handleApplyCoupon} disabled={!couponCode}>APPLY</button>
                    </div>
                    {suggestedCoupons.length > 0 && (
                      <div className="mt-3">
                        <span className="small text-muted fw-bold me-2">Available Offers:</span>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                          {suggestedCoupons.map((c) => (
                            <span 
                              key={c.code} 
                              className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2 cursor-pointer"
                              style={{ cursor: 'pointer' }}
                              onClick={() => setCouponCode(c.code)}
                            >
                              <i className="fas fa-tag me-1"></i>{c.code} <span className="text-dark">({c.discount_percent}% OFF)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {couponMessage.text && (
                      <div className={`form-text ps-1 mt-2 fw-medium ${couponMessage.type === 'success' ? 'text-success' : 'text-danger'}`}>
                        <i className={`fas fa-${couponMessage.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-1`}></i>
                        {couponMessage.text}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                {priceSummary && (
                  <div className="mt-5 p-4 rounded-4 bg-primary bg-opacity-10 border border-primary-subtle">
                    <h6 className="fw-bold mb-4 text-dark text-uppercase">Price Breakdown</h6>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Duration</span><span className="fw-bold">{priceSummary.days} Days</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Daily Rate</span><span className="fw-bold">Rs. {car.price_per_day}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span className="text-muted">Subtotal</span><span className="fw-bold">Rs. {priceSummary.subtotal}</span></div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Delivery Charge</span>
                      <span className={`fw-bold ${priceSummary.deliveryFee > 0 ? 'text-danger' : 'text-success'}`}>{priceSummary.deliveryFee > 0 ? `+ Rs. ${priceSummary.deliveryFee}` : 'Free'}</span>
                    </div>
                    {priceSummary.discount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span className="small fw-bold">Coupon ({discountInfo.percent}%)</span>
                        <span className="small fw-bold">- Rs. {priceSummary.discount}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-primary-subtle">
                      <span className="h5 fw-bold mb-0">Total Amount</span>
                      <span className="h4 fw-bold text-primary mb-0">Rs. {priceSummary.total}</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100 mt-5 py-3 fw-bold rounded-pill shadow-lg" disabled={submitting || !priceSummary}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>PROCESSING...</> : <><i className="fas fa-check-circle me-2"></i>{bookingData.paymentMethod === 'Online' ? 'BOOK & PAY ONLINE' : 'CONFIRM BOOKING'}</>}
                </button>
              </form>

              <p className="text-center mt-4 text-muted small">
                By clicking "Confirm Booking", you agree to our <Link to="/contact" className="text-primary text-decoration-none">Terms and Conditions</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOOKING CONFIRMATION MODAL ===== */}
      {confirmedBooking && (
        <div className="modal d-block animate__animated animate__fadeIn" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              {/* Modal Header */}
              <div className="bg-success text-white p-4 text-center">
                <div className="mb-3">
                  <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-check-circle fa-3x"></i>
                  </div>
                </div>
                <h3 className="fw-bold mb-1">Booking Confirmed!</h3>
                <p className="mb-0 opacity-75">
                  {confirmedBooking.payment_status === 'Paid' ? 'Payment successful! Your car is reserved.' : 'Your request has been received. Pending admin confirmation.'}
                </p>
              </div>

              {/* Booking ID Banner */}
              <div className="bg-light px-4 py-3 d-flex justify-content-between align-items-center border-bottom">
                <span className="text-muted small fw-bold text-uppercase">Booking ID</span>
                <span className="fw-bold text-primary fs-5">#RNT-{confirmedBooking.booking_id}</span>
              </div>

              <div className="modal-body p-4">
                {/* Car Info Row */}
                <div className="d-flex align-items-center p-3 bg-light rounded-4 mb-4 border border-white shadow-sm">
                  <img
                    src={(Array.isArray(car?.image_url) ? car.image_url[0] : car?.image_url) || '/assets/img/car.png'}
                    alt={car?.name}
                    className="rounded-3"
                    style={{ width: '100px', height: '70px', objectFit: 'cover' }}
                  />
                  <div className="ms-3">
                    <h5 className="fw-bold mb-0">{car?.brand} {car?.name}</h5>
                    <p className="text-muted small mb-0">{car?.fuel_type} &bull; {car?.transmission}</p>
                  </div>
                  <div className="ms-auto text-end">
                    <span className={`badge rounded-pill px-3 py-2 ${confirmedBooking.payment_status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {confirmedBooking.payment_status === 'Paid' ? '✓ Paid' : 'Pending Payment'}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="row g-3">
                  {[
                    { icon: 'fas fa-calendar-check text-primary', label: 'Pickup Date', value: bookingData.startDate },
                    { icon: 'fas fa-calendar-times text-danger', label: 'Return Date', value: bookingData.endDate },
                    { icon: 'fas fa-map-pin text-success', label: 'Pickup Address', value: bookingData.isPermanentLocation ? (car?.address || 'Car Location') : bookingData.pickupLocation },
                    { icon: 'fas fa-undo text-warning', label: 'Return Address', value: bookingData.isPermanentLocation ? (car?.address || 'Car Location') : (sameAsPickup ? bookingData.pickupLocation : bookingData.dropLocation) },
                    { icon: 'fas fa-moon text-info', label: 'Duration', value: `${priceSummary?.days} Days` },
                    { icon: 'fas fa-credit-card text-primary', label: 'Payment Method', value: confirmedBooking.payment_status === 'Paid' ? 'Online (Razorpay)' : 'Cash on Pickup' },
                  ].map((item) => (
                    <div className="col-md-6" key={item.label}>
                      <div className="d-flex align-items-start p-3 bg-light rounded-3">
                        <i className={`${item.icon} mt-1 me-3 fs-5`}></i>
                        <div>
                          <div className="text-muted small fw-bold">{item.label}</div>
                          <div className="fw-bold small">{item.value || '—'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Amount Summary */}
                <div className="mt-4 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary-subtle d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">Total Amount</div>
                    {priceSummary?.discount > 0 && <div className="text-success small">Saved Rs. {priceSummary.discount} with coupon</div>}
                  </div>
                  <div className="h4 fw-bold text-primary mb-0">Rs. {confirmedBooking.final_price || priceSummary?.total}</div>
                </div>

                <div className="mt-3 p-3 rounded-3 bg-light d-flex align-items-center">
                  <i className="fas fa-envelope text-primary me-3"></i>
                  <p className="mb-0 small text-muted">A confirmation email has been sent to <strong>{userInfo?.email}</strong></p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer border-0 p-4 gap-2 justify-content-center">
                <Link to={`/invoice/${confirmedBooking.booking_id}`} className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                  <i className="fas fa-file-invoice me-2"></i>View Invoice
                </Link>
                <button
                  className="btn btn-primary rounded-pill px-4 fw-bold shadow"
                  onClick={() => { setConfirmedBooking(null); navigate('/profile?tab=bookings'); }}
                >
                  <i className="fas fa-list-alt me-2"></i>View My Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookingPage;
