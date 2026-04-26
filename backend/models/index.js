const User = require('./User');
const Car = require('./Car');
const Booking = require('./Booking');
const Review = require('./Review');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const Notification = require('./Notification');
const ContactMessage = require('./ContactMessage');
const UserDocument = require('./UserDocument');
const CityPoint = require('./CityPoint');
const PasswordReset = require('./PasswordReset');
const Maintenance = require('./Maintenance');
const Expense = require('./Expense');


// User - Booking Association
User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Car - Booking Association
Car.hasMany(Booking, { foreignKey: 'car_id', as: 'bookings' });
Booking.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

// User - Review Association
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Car - Review Association
Car.hasMany(Review, { foreignKey: 'car_id', as: 'reviews' });
Review.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

// User - Notification Association
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - UserDocument Association
User.hasOne(UserDocument, { foreignKey: 'user_id', as: 'documents' });
UserDocument.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Coupon - CouponUsage Association
Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

// User - CouponUsage Association
User.hasMany(CouponUsage, { foreignKey: 'user_id', as: 'couponUsages' });
CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Car - Maintenance Association
Car.hasMany(Maintenance, { foreignKey: 'car_id', as: 'maintenanceRecords' });
Maintenance.belongsTo(Car, { foreignKey: 'car_id', as: 'car' });

module.exports = {
  User, Car, Booking, Review, Coupon, CouponUsage,
  Notification, ContactMessage, UserDocument, CityPoint,
  PasswordReset, Maintenance, Expense
};

