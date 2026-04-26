package com.carent.repository;

import com.carent.config.DBConnection;
import com.carent.model.Review;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReviewDAO {

    public boolean insertReview(Review review) {
        String sql = "INSERT INTO reviews (booking_id, user_id, car_id, rating, comment) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, review.getBookingId());
            ps.setInt(2, review.getUserId());
            ps.setInt(3, review.getCarId());
            ps.setInt(4, review.getRating());
            ps.setString(5, review.getComment());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Review> getReviewsByCarId(int carId) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT r.*, u.full_name AS user_name, c.name AS car_name FROM reviews r " +
                     "JOIN users u ON r.user_id = u.user_id " +
                     "JOIN cars c ON r.car_id = c.car_id " +
                     "WHERE r.car_id = ? ORDER BY r.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    reviews.add(mapResultSetToReview(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    public List<Review> getAllReviews() {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT r.*, u.full_name AS user_name, c.name AS car_name FROM reviews r " +
                     "JOIN users u ON r.user_id = u.user_id " +
                     "JOIN cars c ON r.car_id = c.car_id " +
                     "ORDER BY r.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                reviews.add(mapResultSetToReview(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    public List<Review> getReviewsWithPagination(int offset, int limit) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT r.*, u.full_name AS user_name, c.name AS car_name FROM reviews r " +
                     "JOIN users u ON r.user_id = u.user_id " +
                     "JOIN cars c ON r.car_id = c.car_id " +
                     "ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    reviews.add(mapResultSetToReview(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }

    public double getAverageRating(int carId) {
        String sql = "SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getDouble(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getReviewCount(int carId) {
        String sql = "SELECT COUNT(*) FROM reviews WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getTotalReviewCount() {
        String sql = "SELECT COUNT(*) FROM reviews";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    /**
     * Check if user can review: booking must be Completed and no prior review for that booking.
     */
    public boolean canUserReview(int userId, int bookingId) {
        String sql = "SELECT COUNT(*) FROM bookings b " +
                     "WHERE b.booking_id = ? AND b.user_id = ? AND b.booking_status = 'Completed' " +
                     "AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.booking_id = b.booking_id)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            ps.setInt(2, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean hasReviewForBooking(int bookingId) {
        String sql = "SELECT COUNT(*) FROM reviews WHERE booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteReview(int reviewId) {
        String sql = "DELETE FROM reviews WHERE review_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, reviewId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private Review mapResultSetToReview(ResultSet rs) throws SQLException {
        Review r = new Review();
        r.setReviewId(rs.getInt("review_id"));
        r.setBookingId(rs.getInt("booking_id"));
        r.setUserId(rs.getInt("user_id"));
        r.setCarId(rs.getInt("car_id"));
        r.setRating(rs.getInt("rating"));
        r.setComment(rs.getString("comment"));
        r.setCreatedAt(rs.getTimestamp("created_at"));
        try { r.setUserName(rs.getString("user_name")); } catch (SQLException ignored) {}
        try { r.setCarName(rs.getString("car_name")); } catch (SQLException ignored) {}
        return r;
    }
}
