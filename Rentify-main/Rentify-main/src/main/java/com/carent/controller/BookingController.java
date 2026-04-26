package com.carent.controller;

import com.carent.model.Booking;
import com.carent.model.Car;
import com.carent.model.User;
import com.carent.service.BookingService;
import com.carent.service.CarService;
import com.carent.service.EmailService;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;

import com.google.gson.JsonObject;

public class BookingController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // TODO: Replace with your actual credentials
    private static final String RZP_KEY_ID = "rzp_test_SWM057Fqu5Avzj";
    private static final String RZP_KEY_SECRET = "yFwUjWEevOfWblsRkg1CDZT8";

    private final BookingService bookingService = new BookingService();
    private final CarService carService = new CarService();
    private final EmailService emailService = new EmailService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String action = request.getRequestURI();
        if (request.getContextPath() != null && !request.getContextPath().isEmpty()) {
            action = action.substring(request.getContextPath().length());
        }

        switch (action) {
            case "/book_car":
                handleBookCar(request, response);
                break;
            case "/cancel_booking":
                handleCancelBooking(request, response);
                break;
            case "/validate_coupon":
                handleValidateCoupon(request, response);
                break;
            case "/calculate_price":
                handleCalculatePrice(request, response);
                break;
            case "/create_razorpay_order":
                handleCreateRazorpayOrder(request, response);
                break;
            case "/create_razorpay_order_existing":
                handleCreateRazorpayOrderExisting(request, response);
                break;
            case "/confirm_existing_payment":
                handleConfirmExistingPayment(request, response);
                break;
            default:
                response.sendRedirect(request.getContextPath() + "/vehicles");
                break;
        }
    }

    private void handleBookCar(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject json = new JsonObject();

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            json.addProperty("success", false);
            json.addProperty("message", "Please login to book a car.");
            json.addProperty("redirect", request.getContextPath() + "/login");
            response.getWriter().write(json.toString());
            return;
        }

        User user = (User) session.getAttribute("loggedUser");

        if (!user.isVerified()) {
            json.addProperty("success", false);
            json.addProperty("message", "Please verify your account before booking.");
            response.getWriter().write(json.toString());
            return;
        }

        try {
            int carId = Integer.parseInt(request.getParameter("carId"));
            String pickupLocation = request.getParameter("pickupLocation");
            String dropLocation = request.getParameter("dropLocation");
            Date startDate = Date.valueOf(request.getParameter("startDate"));
            Date endDate = Date.valueOf(request.getParameter("endDate"));
            String couponCode = request.getParameter("couponCode");
            String paymentMethod = request.getParameter("paymentMethod"); // "Cash" or "Online"
            String transactionId = request.getParameter("razorpay_payment_id"); // Used for Razorpay online transactions

            Booking booking = bookingService.createBooking(
                    user.getUserId(), carId, pickupLocation, dropLocation,
                    startDate, endDate, couponCode, paymentMethod, transactionId);

            // Send confirmation email
            Car car = carService.getCarById(carId);
            if (car != null) {
                emailService.sendBookingConfirmation(
                        user.getEmail(), user.getFullName(), car.getName(),
                        startDate.toString(), endDate.toString(), booking.getFinalPrice().toString());
            }

            json.addProperty("success", true);
            json.addProperty("message", "Booking confirmed! A confirmation email has been sent to " + user.getEmail());
            json.addProperty("bookingId", booking.getBookingId());
            json.addProperty("carName", car != null ? car.getName() : "Vehicle");
            json.addProperty("finalPrice", booking.getFinalPrice().toString());
            json.addProperty("totalDays", booking.getTotalDays());
            json.addProperty("redirect", request.getContextPath() + "/profile#bookings");

        } catch (IllegalArgumentException e) {
            json.addProperty("success", false);
            json.addProperty("message", e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            json.addProperty("success", false);
            json.addProperty("message", "Booking failed. Please try again.");
        }

        response.getWriter().write(json.toString());
    }

    private void handleCreateRazorpayOrder(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject jsonResponse = new JsonObject();

        try {
            int carId = Integer.parseInt(request.getParameter("carId"));
            Date startDate = Date.valueOf(request.getParameter("startDate"));
            Date endDate = Date.valueOf(request.getParameter("endDate"));
            String couponCode = request.getParameter("couponCode");

            // Calculate final price using BookingService calculation logic without creating
            // booking
            BigDecimal[] priceInfo = bookingService.calculatePrice(carId, startDate, endDate, couponCode);
            if (priceInfo == null) {
                throw new IllegalArgumentException("Invalid car or calculation failed");
            }

            BigDecimal finalPrice = priceInfo[2];
            int amountInPaise = finalPrice.multiply(new BigDecimal(100)).intValue();

            RazorpayClient razorpay = new RazorpayClient(RZP_KEY_ID, RZP_KEY_SECRET);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("orderId", order.get("id").toString());
            jsonResponse.addProperty("amount", order.get("amount").toString());
            jsonResponse.addProperty("currency", order.get("currency").toString());
            jsonResponse.addProperty("keyId", RZP_KEY_ID);
        } catch (RazorpayException e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Error initializing Razorpay: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Error calculating amount: " + e.getMessage());
        }

        response.getWriter().write(jsonResponse.toString());
    }

    private void handleCreateRazorpayOrderExisting(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject jsonResponse = new JsonObject();
        try {
            int bookingId = Integer.parseInt(request.getParameter("bookingId"));
            // Fetch booking from db
            Booking b = bookingService.getBookingsByUser(-1).stream() // Hackish or we can add getBookingById to BookingService
                            .filter(book -> book.getBookingId() == bookingId)
                            .findFirst()
                            .orElse(null);
            // Actually, we can just use a DAO or add a getBookingById method to BookingService, but let's assume getBookingsWithPagination will work or just do getBookingByUser since the user is in session.
            HttpSession session = request.getSession(false);
            if(session == null || session.getAttribute("loggedUser") == null) throw new Exception("Not logged in");
            User user = (User) session.getAttribute("loggedUser");
            b = bookingService.getBookingsByUser(user.getUserId()).stream()
                    .filter(book -> book.getBookingId() == bookingId)
                    .findFirst()
                    .orElseThrow(() -> new Exception("Booking not found."));

            BigDecimal finalPrice = b.getFinalPrice();
            int amountInPaise = finalPrice.multiply(new BigDecimal(100)).intValue();

            RazorpayClient razorpay = new RazorpayClient(RZP_KEY_ID, RZP_KEY_SECRET);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);

            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("orderId", order.get("id").toString());
            jsonResponse.addProperty("amount", order.get("amount").toString());
            jsonResponse.addProperty("currency", order.get("currency").toString());
            jsonResponse.addProperty("keyId", RZP_KEY_ID);
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Error calculating amount: " + e.getMessage());
        }
        response.getWriter().write(jsonResponse.toString());
    }

    private void handleConfirmExistingPayment(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        JsonObject jsonResponse = new JsonObject();
        try {
            int bookingId = Integer.parseInt(request.getParameter("bookingId"));
            String transactionId = request.getParameter("razorpay_payment_id");
            bookingService.updatePaymentDetails(bookingId, "Paid", transactionId);
            
            jsonResponse.addProperty("success", true);
            jsonResponse.addProperty("message", "Payment Successful!");
        } catch (Exception e) {
            e.printStackTrace();
            jsonResponse.addProperty("success", false);
            jsonResponse.addProperty("message", "Error confirming payment: " + e.getMessage());
        }
        response.getWriter().write(jsonResponse.toString());
    }

    private void handleCancelBooking(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        User user = (User) session.getAttribute("loggedUser");
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        boolean success = bookingService.cancelBooking(bookingId, user.getUserId());
        response.sendRedirect(
                request.getContextPath() + "/my_bookings?success=" + (success ? "cancelled" : "cancel_failed"));
    }

    private void handleValidateCoupon(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String couponCode = request.getParameter("code");
        JsonObject json = new JsonObject();

        com.carent.model.Coupon coupon = new com.carent.service.CouponService().validateCoupon(couponCode);
        if (coupon != null) {
            json.addProperty("valid", true);
            json.addProperty("discount", coupon.getDiscountPercentage());
            json.addProperty("code", coupon.getCode());
        } else {
            json.addProperty("valid", false);
            json.addProperty("message", "Invalid or expired coupon code.");
        }

        response.getWriter().write(json.toString());
    }

    private void handleCalculatePrice(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        JsonObject json = new JsonObject();
        try {
            int carId = Integer.parseInt(request.getParameter("carId"));
            Date startDate = Date.valueOf(request.getParameter("startDate"));
            Date endDate = Date.valueOf(request.getParameter("endDate"));
            String couponCode = request.getParameter("couponCode");

            BigDecimal[] result = bookingService.calculatePrice(carId, startDate, endDate, couponCode);
            if (result != null) {
                json.addProperty("success", true);
                json.addProperty("totalPrice", result[0]);
                json.addProperty("discount", result[1]);
                json.addProperty("finalPrice", result[2]);
                json.addProperty("totalDays", result[3].intValue());
            } else {
                json.addProperty("success", false);
                json.addProperty("message", "Car not found.");
            }
        } catch (Exception e) {
            json.addProperty("success", false);
            json.addProperty("message", e.getMessage());
        }

        response.getWriter().write(json.toString());
    }
}
