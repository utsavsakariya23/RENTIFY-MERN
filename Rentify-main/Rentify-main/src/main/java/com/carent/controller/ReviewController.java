package com.carent.controller;

import com.carent.model.Review;
import com.carent.model.User;
import com.carent.service.ReviewService;
import com.carent.repository.BookingDAO;
import com.carent.model.Booking;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class ReviewController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ReviewService reviewService = new ReviewService();
    private final BookingDAO bookingDAO = new BookingDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login");
            return;
        }

        User user = (User) session.getAttribute("loggedUser");

        try {
            int bookingId = Integer.parseInt(request.getParameter("bookingId"));
            int rating = Integer.parseInt(request.getParameter("rating"));
            String comment = request.getParameter("comment");

            // Get booking to find carId
            Booking booking = bookingDAO.getBookingById(bookingId);
            if (booking == null || booking.getUserId() != user.getUserId()) {
                response.sendRedirect(request.getContextPath() + "/my_bookings?error=invalid_booking");
                return;
            }

            Review review = new Review();
            review.setBookingId(bookingId);
            review.setUserId(user.getUserId());
            review.setCarId(booking.getCarId());
            review.setRating(rating);
            review.setComment(comment);

            boolean success = reviewService.submitReview(review);
            if (success) {
                response.sendRedirect(request.getContextPath() + "/my_bookings?success=review_submitted");
            } else {
                response.sendRedirect(request.getContextPath() + "/my_bookings?error=review_failed");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect(request.getContextPath() + "/my_bookings?error=review_error");
        }
    }
}
