// ── Rentify Form Validation Utilities ──────────────────────────────────────

export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

export const isValidPassword = (password) =>
  password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);

export const isValidOTP = (otp) =>
  /^\d{6}$/.test(otp);

export const isEmpty = (val) =>
  !val || val.trim().length === 0;

// Validate Login Form
export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (isEmpty(password)) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

// Validate Registration Step 1 (Email)
export const validateRegisterEmail = ({ email }) => {
  const errors = {};
  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  return errors;
};

// Validate Registration Step 2 (Personal Details)
export const validateRegisterPersonal = ({ fullName, phone }) => {
  const errors = {};
  if (isEmpty(fullName)) errors.fullName = 'Full name is required';
  else if (fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters';
  if (!isEmpty(phone) && !isValidPhone(phone))
    errors.phone = 'Enter a valid 10-digit Indian mobile number';
  return errors;
};

// Validate Registration Step 3 (Account Setup)
export const validateRegisterPassword = ({ password, confirmPassword }) => {
  const errors = {};
  if (isEmpty(password)) errors.password = 'Password is required';
  else if (!isValidPassword(password))
    errors.password = 'Password must be 8+ characters with at least 1 letter and 1 number';
  if (isEmpty(confirmPassword)) errors.confirmPassword = 'Please confirm your password';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

// Validate Contact Form
export const validateContact = ({ name, email, message }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Full name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (isEmpty(message)) errors.message = 'Message is required';
  else if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
  return errors;
};

// Validate Booking Form
export const validateBooking = ({ startDate, endDate, pickupLocation, dropLocation }) => {
  const errors = {};
  const today = new Date().toISOString().split('T')[0];
  if (!startDate) errors.startDate = 'Pickup date is required';
  else if (startDate < today) errors.startDate = 'Pickup date cannot be in the past';
  if (!endDate) errors.endDate = 'Return date is required';
  else if (endDate < startDate) errors.endDate = 'Return date must be after pickup date';
  if (isEmpty(pickupLocation)) errors.pickupLocation = 'Pickup location is required';
  if (isEmpty(dropLocation)) errors.dropLocation = 'Drop location is required';
  return errors;
};

// Validate Admin Car Form
export const validateCar = ({ name, brand, price_per_day, seats, fuel_type, transmission }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Car name is required';
  if (isEmpty(brand)) errors.brand = 'Brand is required';
  if (!price_per_day || isNaN(price_per_day) || Number(price_per_day) <= 0)
    errors.price_per_day = 'Enter a valid price per day';
  if (!seats || isNaN(seats) || Number(seats) < 1 || Number(seats) > 10)
    errors.seats = 'Seats must be between 1 and 10';
  if (isEmpty(fuel_type)) errors.fuel_type = 'Fuel type is required';
  if (isEmpty(transmission)) errors.transmission = 'Transmission type is required';
  return errors;
};

// Validate Coupon Form
export const validateCoupon = ({ code, discount_percent, expiry_date }) => {
  const errors = {};
  if (isEmpty(code)) errors.code = 'Coupon code is required';
  else if (!/^[A-Z0-9]{3,20}$/.test(code.toUpperCase()))
    errors.code = 'Code must be 3-20 alphanumeric characters (no spaces)';
  if (!discount_percent || isNaN(discount_percent) || discount_percent < 1 || discount_percent > 100)
    errors.discount_percent = 'Discount must be between 1 and 100';
  if (expiry_date && expiry_date < new Date().toISOString().split('T')[0])
    errors.expiry_date = 'Expiry date must be in the future';
  return errors;
};

// Validate Profile Update
export const validateProfileUpdate = ({ name, newPassword, confirmPassword, currentPassword }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Name is required';
  if (newPassword) {
    if (!currentPassword) errors.currentPassword = 'Current password is required to change password';
    if (!isValidPassword(newPassword))
      errors.newPassword = 'Password must be 8+ characters with at least 1 letter and 1 number';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
  }
  return errors;
};

// Helper: Display error below field
// Usage: <FieldError error={errors.email} />
export const hasErrors = (errors) => Object.keys(errors).length > 0;
