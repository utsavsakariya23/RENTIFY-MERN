package com.carent.controller;

import com.carent.model.*;
import com.carent.service.*;
import com.carent.repository.UserDAO;
import com.carent.util.PasswordUtil;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.sql.Date;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

public class AdminController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final CarService carService = new CarService();
    private final BookingService bookingService = new BookingService();
    private final CouponService couponService = new CouponService();
    private final ReviewService reviewService = new ReviewService();
    private final NotificationService notificationService = new NotificationService();
    private final UserDAO userDAO = new UserDAO();
    private final CloudinaryService cloudinaryService = new CloudinaryService();
    private final EmailService emailService = new EmailService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Check admin
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }
        User admin = (User) session.getAttribute("loggedUser");
        if (!"Admin".equalsIgnoreCase(admin.getRole())) {
            response.sendRedirect(request.getContextPath() + "/home");
            return;
        }

        String action = request.getRequestURI();
        if (request.getContextPath() != null && !request.getContextPath().isEmpty()) {
            action = action.substring(request.getContextPath().length());
        }

        switch (action) {
            case "/admin/add_car":
                handleAddCar(request, response);
                break;
            case "/admin/edit_car":
                handleEditCar(request, response);
                break;
            case "/admin/delete_car":
                handleDeleteCar(request, response);
                break;
            case "/admin/update_car_status":
                handleUpdateCarStatus(request, response);
                break;
            case "/admin/confirm_booking":
                handleConfirmBooking(request, response);
                break;
            case "/admin/complete_booking":
                handleCompleteBooking(request, response);
                break;
            case "/admin/cancel_booking":
                handleAdminCancelBooking(request, response);
                break;
            case "/admin/mark_paid":
                handleMarkPaid(request, response);
                break;
            case "/admin/refund_payment":
                handleRefundPayment(request, response);
                break;
            case "/admin/export_payments_csv":
                handleExportPaymentsCsv(request, response);
                break;
            case "/admin/add_coupon":
                handleAddCoupon(request, response);
                break;
            case "/admin/edit_coupon":
                handleEditCoupon(request, response);
                break;
            case "/admin/delete_coupon":
                handleDeleteCoupon(request, response);
                break;
            case "/admin/send_notification":
                handleSendNotification(request, response);
                break;
            case "/admin/reply_message":
                handleReplyMessage(request, response);
                break;
            case "/admin/verify_user":
                handleVerifyUser(request, response);
                break;
            case "/admin/delete_user":
                handleDeleteUser(request, response);
                break;
            case "/admin/delete_review":
                handleDeleteReview(request, response);
                break;
            case "/admin/update_profile":
                handleUpdateProfile(request, response);
                break;
            case "/admin/change_password":
                handleChangePassword(request, response);
                break;
            case "/admin/update_fleet":
                handleUpdateFleet(request, response);
                break;
            default:
                response.sendRedirect(request.getContextPath() + "/admin/dashboard");
                break;
        }
    }

    private void handleUpdateFleet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            int carId = Integer.parseInt(request.getParameter("carId"));
            String status = request.getParameter("status");
            String lastSvc = request.getParameter("lastServiceDate");
            String nextSvc = request.getParameter("nextServiceDate");
            String insExp = request.getParameter("insuranceExpiry");
            String mileageStr = request.getParameter("mileage");

            // Update status
            if (status != null && !status.isEmpty()) {
                carService.updateCarStatus(carId, status);
            }

            // Update fleet info
            Date lastSvcDate = (lastSvc != null && !lastSvc.isEmpty()) ? Date.valueOf(lastSvc) : null;
            Date nextSvcDate = (nextSvc != null && !nextSvc.isEmpty()) ? Date.valueOf(nextSvc) : null;
            Date insExpDate = (insExp != null && !insExp.isEmpty()) ? Date.valueOf(insExp) : null;
            Integer mileage = null;
            try { if (mileageStr != null && !mileageStr.isEmpty()) mileage = Integer.parseInt(mileageStr); } catch (Exception ignored) {}

            com.carent.repository.CarDAO carDAO = new com.carent.repository.CarDAO();
            carDAO.updateFleetInfo(carId, lastSvcDate, nextSvcDate, insExpDate, mileage);

            response.sendRedirect(request.getContextPath() + "/admin/fleet?success=Fleet+info+updated+successfully");
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect(request.getContextPath() + "/admin/fleet?error=Update+failed");
        }
    }

    private void handleAddCar(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        String name = request.getParameter("name");
        String brand = request.getParameter("brand");
        String priceStr = request.getParameter("pricePerDay");
        String fuelType = request.getParameter("fuelType");
        String transmission = request.getParameter("transmission");
        String imageUrl = request.getParameter("imageUrl");

        // Handle file upload if multipart
        if (request.getContentType() != null && request.getContentType().startsWith("multipart/")) {
            try {
                Part filePart = request.getPart("carImage");
                if (filePart != null && filePart.getSize() > 0) {
                    try (InputStream is = filePart.getInputStream()) {
                        String url = cloudinaryService.uploadImage(is, "cars");
                        if (url != null) imageUrl = url;
                    }
                }
            } catch (Exception e) {
                System.err.println("File upload error: " + e.getMessage());
            }
        }

        Car car = new Car();
        car.setName(name);
        car.setBrand(brand);
        car.setPricePerDay(new BigDecimal(priceStr));
        car.setFuelType(fuelType != null ? fuelType : "Petrol");
        car.setTransmission(transmission != null ? transmission : "Automatic");
        car.setImageUrl(imageUrl != null ? imageUrl : "");
        car.setStatus("Available");

        boolean success = carService.addCar(car);
        response.sendRedirect(request.getContextPath() + "/admin/vehicles?success=" + (success ? "car_added" : "failed"));
    }

    private void handleEditCar(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        int carId = Integer.parseInt(request.getParameter("carId"));
        Car car = carService.getCarById(carId);
        if (car == null) {
            response.sendRedirect(request.getContextPath() + "/admin/vehicles?error=not_found");
            return;
        }

        car.setName(request.getParameter("name"));
        car.setBrand(request.getParameter("brand"));
        car.setPricePerDay(new BigDecimal(request.getParameter("pricePerDay")));
        car.setFuelType(request.getParameter("fuelType"));
        car.setTransmission(request.getParameter("transmission"));
        car.setStatus(request.getParameter("status"));

        String imageUrl = request.getParameter("imageUrl");
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            car.setImageUrl(imageUrl);
        }

        if (request.getContentType() != null && request.getContentType().startsWith("multipart/")) {
            try {
                Part filePart = request.getPart("carImage");
                if (filePart != null && filePart.getSize() > 0) {
                    try (InputStream is = filePart.getInputStream()) {
                        String url = cloudinaryService.uploadImage(is, "cars");
                        if (url != null) car.setImageUrl(url);
                    }
                }
            } catch (Exception e) {
                System.err.println("File upload error: " + e.getMessage());
            }
        }

        boolean success = carService.updateCar(car);
        response.sendRedirect(request.getContextPath() + "/admin/vehicles?success=" + (success ? "car_updated" : "failed"));
    }

    private void handleDeleteCar(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int carId = Integer.parseInt(request.getParameter("carId"));
        boolean success = carService.deleteCar(carId);
        response.sendRedirect(request.getContextPath() + "/admin/vehicles?success=" + (success ? "car_deleted" : "failed"));
    }

    private void handleUpdateCarStatus(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int carId = Integer.parseInt(request.getParameter("carId"));
        String status = request.getParameter("status");
        carService.updateCarStatus(carId, status);
        response.sendRedirect(request.getContextPath() + "/admin/vehicles");
    }

    private void handleConfirmBooking(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        bookingService.confirmBooking(bookingId);
        response.sendRedirect(request.getContextPath() + "/admin/rent");
    }

    private void handleCompleteBooking(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        bookingService.completeBooking(bookingId);
        response.sendRedirect(request.getContextPath() + "/admin/rent");
    }

    private void handleAdminCancelBooking(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        bookingService.adminCancelBooking(bookingId);
        response.sendRedirect(request.getContextPath() + "/admin/rent");
    }

    private void handleMarkPaid(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        bookingService.markAsPaid(bookingId);
        // Support redirect back to payments page
        String redirect = request.getParameter("redirect");
        if ("payments".equals(redirect)) {
            response.sendRedirect(request.getContextPath() + "/admin/payments?success=payment_marked_paid");
        } else {
            response.sendRedirect(request.getContextPath() + "/admin/rent?success=payment_marked_paid");
        }
    }

    private void handleRefundPayment(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int bookingId = Integer.parseInt(request.getParameter("bookingId"));
        bookingService.refundBooking(bookingId);
        response.sendRedirect(request.getContextPath() + "/admin/payments?success=booking_refunded");
    }

    private void handleExportPaymentsCsv(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"payments_export.csv\"");
        java.util.List<com.carent.model.Booking> all = bookingService.getFilteredPayments(null, null, 1, 10000);
        java.io.PrintWriter pw = response.getWriter();
        pw.println("Booking ID,Customer,Car,Amount (Rs),Method,Transaction ID,Payment Status,Booking Status,Date");
        for (com.carent.model.Booking b : all) {
            pw.printf("\"%s\",\"%s\",\"%s %s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                b.getBookingId(),
                b.getUserName() != null ? b.getUserName() : "",
                b.getCarBrand() != null ? b.getCarBrand() : "",
                b.getCarName() != null ? b.getCarName() : "",
                b.getFinalPrice(),
                b.getPaymentMethod() != null ? b.getPaymentMethod() : "Cash",
                b.getTransactionId() != null ? b.getTransactionId() : "",
                b.getPaymentStatus(),
                b.getBookingStatus(),
                b.getCreatedAt()
            );
        }
        pw.flush();
    }

    private void handleAddCoupon(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Coupon coupon = new Coupon();
        coupon.setCode(request.getParameter("code"));
        coupon.setDiscountPercentage(new BigDecimal(request.getParameter("discountPercentage")));
        coupon.setExpiryDate(Date.valueOf(request.getParameter("expiryDate")));
        coupon.setActive("on".equals(request.getParameter("isActive")) || "true".equals(request.getParameter("isActive")));
        couponService.addCoupon(coupon);
        response.sendRedirect(request.getContextPath() + "/admin/coupons?success=coupon_added");
    }

    private void handleEditCoupon(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Coupon coupon = new Coupon();
        coupon.setCouponId(Integer.parseInt(request.getParameter("couponId")));
        coupon.setCode(request.getParameter("code"));
        coupon.setDiscountPercentage(new BigDecimal(request.getParameter("discountPercentage")));
        coupon.setExpiryDate(Date.valueOf(request.getParameter("expiryDate")));
        coupon.setActive("on".equals(request.getParameter("isActive")) || "true".equals(request.getParameter("isActive")));
        couponService.updateCoupon(coupon);
        response.sendRedirect(request.getContextPath() + "/admin/coupons?success=coupon_updated");
    }

    private void handleDeleteCoupon(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int couponId = Integer.parseInt(request.getParameter("couponId"));
        couponService.deleteCoupon(couponId);
        response.sendRedirect(request.getContextPath() + "/admin/coupons?success=coupon_deleted");
    }

    private void handleSendNotification(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String message = request.getParameter("message");
        boolean sendEmail = "on".equals(request.getParameter("sendEmail"));
        notificationService.sendNotification(message, sendEmail);
        response.sendRedirect(request.getContextPath() + "/admin/notifications?success=notification_sent");
    }

    private void handleReplyMessage(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int messageId = Integer.parseInt(request.getParameter("messageId"));
        String reply = request.getParameter("reply");

        com.carent.repository.ContactMessageDAO messageDAO = new com.carent.repository.ContactMessageDAO();
        ContactMessage msg = messageDAO.getMessageById(messageId);

        if (msg != null && reply != null && !reply.trim().isEmpty()) {
            messageDAO.replyToMessage(messageId, reply);
            // Send reply email
            emailService.sendContactReply(msg.getEmail(), msg.getName(), msg.getSubject(), reply);
        }
        response.sendRedirect(request.getContextPath() + "/admin/messages?success=reply_sent");
    }

    private void handleVerifyUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int userId = Integer.parseInt(request.getParameter("userId"));
        String action = request.getParameter("action");
        boolean verified = "verify".equals(action);
        userDAO.updateVerificationStatus(userId, verified);
        response.sendRedirect(request.getContextPath() + "/admin/customers");
    }

    private void handleDeleteUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int userId = Integer.parseInt(request.getParameter("userId"));
        userDAO.deleteUser(userId);
        response.sendRedirect(request.getContextPath() + "/admin/customers");
    }

    private void handleDeleteReview(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int reviewId = Integer.parseInt(request.getParameter("reviewId"));
        reviewService.deleteReview(reviewId);
        response.sendRedirect(request.getContextPath() + "/admin/reviews");
    }

    private void handleUpdateProfile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        User sessionUser = (User) session.getAttribute("loggedUser");
        if (sessionUser == null) return;

        User user = userDAO.getUserById(sessionUser.getUserId());
        if (user != null) {
            String fullName = request.getParameter("fullName");
            String phone = request.getParameter("phone");

            user.setFullName(fullName);
            user.setPhone(phone);

            if (userDAO.updateUser(user)) {
                session.setAttribute("loggedUser", user);
                response.sendRedirect(request.getContextPath() + "/admin/profile?success=profile_updated");
            } else {
                response.sendRedirect(request.getContextPath() + "/admin/profile?error=update_failed");
            }
        }
    }

    private void handleChangePassword(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        User sessionUser = (User) session.getAttribute("loggedUser");
        if (sessionUser == null) {
            response.getWriter().write("{\"success\": false, \"message\": \"Not authenticated.\"}");
            return;
        }

        User user = userDAO.getUserById(sessionUser.getUserId());
        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");

        if (!PasswordUtil.verifyPassword(currentPassword, user.getPassword())) {
            response.getWriter().write("{\"success\": false, \"message\": \"Incorrect current password.\"}");
            return;
        }

        String hashedNewPassword = PasswordUtil.hashPassword(newPassword);
        if (userDAO.updatePassword(user.getUserId(), hashedNewPassword)) {
            response.getWriter().write("{\"success\": true, \"message\": \"Password changed successfully.\"}");
        } else {
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred. Please try again.\"}");
        }
    }

    private void handleRefundPayment(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String bidStr = request.getParameter("bookingId");
        String redirect = request.getParameter("redirect");
        if (bidStr != null) {
            try {
                int bookingId = Integer.parseInt(bidStr);
                bookingService.refundBooking(bookingId);
            } catch (NumberFormatException ignored) {}
        }
        String back = (redirect != null && redirect.equals("payments"))
            ? "/admin/payments" : "/admin/rent";
        response.sendRedirect(request.getContextPath() + back + "?success=Refund+processed");
    }

    private void handleExportPaymentsCsv(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String startDate = request.getParameter("startDate");
        String endDate = request.getParameter("endDate");
        String preset = request.getParameter("preset");
        String payStatus = request.getParameter("payStatus");
        String payMethod = request.getParameter("payMethod");

        // Handle presets
        java.time.LocalDate today = java.time.LocalDate.now();
        if (preset != null) {
            switch (preset) {
                case "this_month":
                    startDate = today.withDayOfMonth(1).toString();
                    endDate = today.toString();
                    break;
                case "last_month":
                    java.time.LocalDate lastM = today.minusMonths(1);
                    startDate = lastM.withDayOfMonth(1).toString();
                    endDate = lastM.withDayOfMonth(lastM.lengthOfMonth()).toString();
                    break;
                case "last_3_months":
                    startDate = today.minusMonths(3).toString();
                    endDate = today.toString();
                    break;
                case "this_year":
                    startDate = today.withDayOfYear(1).toString();
                    endDate = today.toString();
                    break;
            }
        }

        java.util.List<com.carent.model.Booking> bookings = bookingService.getBookingsInDateRange(startDate, endDate, payStatus, payMethod);

        response.setContentType("text/csv; charset=UTF-8");
        String filename = "carent_payments_" + today + ".csv";
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        java.io.PrintWriter pw = response.getWriter();
        pw.println("Booking ID,Customer,Email,Car,Start Date,End Date,Days,Total Price,Discount,Final Price,Payment Method,Transaction ID,Payment Status,Booking Status,Created At");

        java.math.BigDecimal totalRev = java.math.BigDecimal.ZERO;
        for (com.carent.model.Booking b : bookings) {
            pw.println(String.join(",",
                String.valueOf(b.getBookingId()),
                csvEsc(b.getUserName()),
                csvEsc(b.getUserEmail()),
                csvEsc((b.getCarBrand() != null ? b.getCarBrand() : "") + " " + (b.getCarName() != null ? b.getCarName() : "")),
                String.valueOf(b.getStartDate()),
                String.valueOf(b.getEndDate()),
                String.valueOf(b.getTotalDays()),
                String.valueOf(b.getTotalPrice()),
                String.valueOf(b.getDiscountAmount() != null ? b.getDiscountAmount() : 0),
                String.valueOf(b.getFinalPrice()),
                csvEsc(b.getPaymentMethod() != null ? b.getPaymentMethod() : "Cash"),
                csvEsc(b.getTransactionId() != null ? b.getTransactionId() : ""),
                csvEsc(b.getPaymentStatus()),
                csvEsc(b.getBookingStatus()),
                String.valueOf(b.getCreatedAt())
            ));
            if ("Paid".equals(b.getPaymentStatus()) && b.getFinalPrice() != null) {
                totalRev = totalRev.add(b.getFinalPrice());
            }
        }
        pw.println();
        pw.println(",,,,,,,,,Total Revenue (Paid):," + totalRev + ",,,,");
    }

    private String csvEsc(String s) {
        if (s == null) return "";
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}

