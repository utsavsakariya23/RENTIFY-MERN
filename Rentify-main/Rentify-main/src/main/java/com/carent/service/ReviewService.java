package com.carent.service;

import com.carent.model.Review;
import com.carent.repository.ReviewDAO;

import java.util.List;

public class ReviewService {
    private final ReviewDAO reviewDAO = new ReviewDAO();

    public boolean submitReview(Review review) {
        // Check eligibility
        if (!reviewDAO.canUserReview(review.getUserId(), review.getBookingId())) {
            return false;
        }
        return reviewDAO.insertReview(review);
    }

    public List<Review> getReviewsByCarId(int carId) {
        return reviewDAO.getReviewsByCarId(carId);
    }

    public List<Review> getAllReviews() {
        return reviewDAO.getAllReviews();
    }

    public List<Review> getReviewsWithPagination(int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return reviewDAO.getReviewsWithPagination(offset, pageSize);
    }

    public double getAverageRating(int carId) {
        return reviewDAO.getAverageRating(carId);
    }

    public int getReviewCount(int carId) {
        return reviewDAO.getReviewCount(carId);
    }

    public int getTotalReviewCount() {
        return reviewDAO.getTotalReviewCount();
    }

    public boolean canUserReview(int userId, int bookingId) {
        return reviewDAO.canUserReview(userId, bookingId);
    }

    public boolean hasReviewForBooking(int bookingId) {
        return reviewDAO.hasReviewForBooking(bookingId);
    }

    public boolean deleteReview(int reviewId) {
        return reviewDAO.deleteReview(reviewId);
    }
}
