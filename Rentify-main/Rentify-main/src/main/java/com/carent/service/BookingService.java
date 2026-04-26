package com.carent.service;

import com.carent.model.Booking;
import com.carent.model.Car;
import com.carent.model.Coupon;
import com.carent.repository.BookingDAO;
import com.carent.repository.CarDAO;
import com.carent.repository.CouponDAO;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class BookingService {
    private final BookingDAO bookingDAO = new BookingDAO();
    private final CarDAO carDAO = new CarDAO();
    private final CouponDAO couponDAO = new CouponDAO();

    /**
     * Full booking flow:
     * 1. Validate dates
     * 2. Check car availability
     * 3. Calculate total price
     * 4. Apply coupon if provided
     * 5. Save booking
     */
    public Booking createBooking(int userId, int carId, String pickupLocation, String dropLocation,
                                  Date startDate, Date endDate, String couponCode,
                                  String paymentMethod, String transactionId) {

        // Validate dates
        if (startDate == null || endDate == null || !endDate.after(startDate)) {
            throw new IllegalArgumentException("Invalid dates: end date must be after start date.");
        }

        // Check car availability
        Car car = carDAO.getCarById(carId);
        if (car == null) throw new IllegalArgumentException("Car not found.");
        if ("Service".equals(car.getStatus())) throw new IllegalArgumentException("Car is currently under service.");
        if (!carDAO.isCarAvailable(carId, startDate, endDate)) {
            throw new IllegalArgumentException("Car is not available for the selected dates.");
        }

        // Calculate days
        long diffMs = endDate.getTime() - startDate.getTime();
        int totalDays = (int) TimeUnit.DAYS.convert(diffMs, TimeUnit.MILLISECONDS);
        if (totalDays <= 0) totalDays = 1;

        // Calculate price
        BigDecimal pricePerDay = car.getPricePerDay();
        BigDecimal totalPrice = pricePerDay.multiply(BigDecimal.valueOf(totalDays));
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalPrice = totalPrice;

        // Apply coupon
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponDAO.validateCoupon(couponCode.trim());
            if (coupon != null) {
                discountAmount = totalPrice.multiply(coupon.getDiscountPercentage())
                                           .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                finalPrice = totalPrice.subtract(discountAmount);
            }
        }

        // Create booking
        Booking booking = new Booking();
        booking.setUserId(userId);
        booking.setCarId(carId);
        booking.setPickupLocation(pickupLocation);
        booking.setDropLocation(dropLocation);
        booking.setStartDate(startDate);
        booking.setEndDate(endDate);
        booking.setTotalDays(totalDays);
        booking.setTotalPrice(totalPrice);
        booking.setDiscountAmount(discountAmount);
        booking.setFinalPrice(finalPrice);
        booking.setPaymentMethod(paymentMethod != null ? paymentMethod : "Cash");
        booking.setTransactionId(transactionId);
        booking.setBookingStatus("Pending");
        
        // If razorpay payment was success online, mark Paid immediately.
        if ("Online".equalsIgnoreCase(paymentMethod) && transactionId != null && !transactionId.isEmpty()) {
            booking.setPaymentStatus("Paid");
            booking.setBookingStatus("Confirmed");
        } else {
            booking.setPaymentStatus("Unpaid");
        }

        boolean success = bookingDAO.insertBooking(booking);
        if (!success) throw new RuntimeException("Failed to create booking.");

        // Set transient display fields
        booking.setCarName(car.getName());
        booking.setCarBrand(car.getBrand());

        return booking;
    }

    public List<Booking> getBookingsByUser(int userId) {
        return bookingDAO.getBookingsByUser(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingDAO.getAllBookings();
    }

    public List<Booking> getBookingsWithPagination(int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return bookingDAO.getBookingsWithPagination(offset, pageSize);
    }

    public Booking getBookingById(int bookingId) {
        return bookingDAO.getBookingById(bookingId);
    }

    public boolean confirmBooking(int bookingId) {
        return bookingDAO.updateBookingStatus(bookingId, "Confirmed");
    }

    public boolean completeBooking(int bookingId) {
        return bookingDAO.updateBookingStatus(bookingId, "Completed");
    }

    public boolean cancelBooking(int bookingId, int userId) {
        Booking booking = bookingDAO.getBookingById(bookingId);
        if (booking == null) return false;
        if (booking.getUserId() != userId) return false;
        if ("Completed".equals(booking.getBookingStatus())) return false;
        return bookingDAO.cancelBooking(bookingId);
    }

    public boolean adminCancelBooking(int bookingId) {
        return bookingDAO.cancelBooking(bookingId);
    }

    public boolean markAsPaid(int bookingId) {
        return bookingDAO.updatePaymentStatus(bookingId, "Paid");
    }

    public boolean updatePaymentDetails(int bookingId, String paymentStatus, String transactionId) {
        return bookingDAO.updatePaymentDetails(bookingId, paymentStatus, transactionId);
    }

    public boolean refundBooking(int bookingId) {
        return bookingDAO.refundBooking(bookingId);
    }

    public List<Booking> getFilteredPayments(String payStatus, String payMethod, int page, int pageSize) {
        return bookingDAO.getFilteredBookings(payStatus, payMethod, (page - 1) * pageSize, pageSize);
    }

    public int getFilteredPaymentCount(String payStatus, String payMethod) {
        return bookingDAO.getFilteredBookingCount(payStatus, payMethod);
    }

    public List<Booking> getBookingsByFilter(String filter, int page, int pageSize) {
        return bookingDAO.getBookingsByFilter(filter, (page - 1) * pageSize, pageSize);
    }

    public int getBookingsByFilterCount(String filter) {
        return bookingDAO.getBookingsByFilterCount(filter);
    }

    public int getPaidCount() { return bookingDAO.getPaidCount(); }
    public int getUnpaidCount() { return bookingDAO.getUnpaidCount(); }
    public int getOnlinePaymentCount() { return bookingDAO.getOnlinePaymentCount(); }

    public int getBookingCount() { return bookingDAO.getBookingCount(); }
    public int getActiveBookingCount() { return bookingDAO.getActiveBookingCount(); }
    public int getPendingBookingCount() { return bookingDAO.getPendingBookingCount(); }
    public BigDecimal getTotalRevenue() { return bookingDAO.getTotalRevenue(); }
    public List<Booking> getRecentBookings(int limit) { return bookingDAO.getRecentBookings(limit); }

    // ===== Analytics =====
    public java.util.List<java.util.Map<String, Object>> getMonthlyRevenue(int months) {
        return bookingDAO.getMonthlyRevenue(months);
    }
    public java.util.Map<String, Integer> getBookingCountByStatus() {
        return bookingDAO.getBookingCountByStatus();
    }
    public java.util.Map<String, Integer> getPaymentMethodSplit() {
        return bookingDAO.getPaymentMethodSplit();
    }

    // ===== Date-range export =====
    public List<Booking> getBookingsInDateRange(String start, String end, String payStatus, String payMethod) {
        return bookingDAO.getBookingsInDateRange(start, end, payStatus, payMethod);
    }

    // ===== Overdue =====
    public List<Booking> getOverdueBookings() { return bookingDAO.getOverdueBookings(); }

    /**
     * Calculate price preview (without saving).
     */
    public BigDecimal[] calculatePrice(int carId, Date startDate, Date endDate, String couponCode) {
        Car car = carDAO.getCarById(carId);
        if (car == null) return null;

        long diffMs = endDate.getTime() - startDate.getTime();
        int totalDays = (int) TimeUnit.DAYS.convert(diffMs, TimeUnit.MILLISECONDS);
        if (totalDays <= 0) totalDays = 1;

        BigDecimal totalPrice = car.getPricePerDay().multiply(BigDecimal.valueOf(totalDays));
        BigDecimal discount = BigDecimal.ZERO;

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponDAO.validateCoupon(couponCode.trim());
            if (coupon != null) {
                discount = totalPrice.multiply(coupon.getDiscountPercentage())
                                     .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
        }

        BigDecimal finalPrice = totalPrice.subtract(discount);
        return new BigDecimal[]{totalPrice, discount, finalPrice, BigDecimal.valueOf(totalDays)};
    }
}

