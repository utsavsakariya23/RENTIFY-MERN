package com.carent.repository;

import com.carent.config.DBConnection;
import com.carent.model.Booking;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {

    public boolean insertBooking(Booking booking) {
        String sql = "INSERT INTO bookings (user_id, car_id, pickup_location, drop_location, start_date, end_date, " +
                     "total_days, total_price, discount_amount, final_price, booking_status, payment_method, transaction_id, payment_status) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, booking.getUserId());
            ps.setInt(2, booking.getCarId());
            ps.setString(3, booking.getPickupLocation());
            ps.setString(4, booking.getDropLocation());
            ps.setDate(5, booking.getStartDate());
            ps.setDate(6, booking.getEndDate());
            ps.setInt(7, booking.getTotalDays());
            ps.setBigDecimal(8, booking.getTotalPrice());
            ps.setBigDecimal(9, booking.getDiscountAmount() != null ? booking.getDiscountAmount() : BigDecimal.ZERO);
            ps.setBigDecimal(10, booking.getFinalPrice());
            ps.setString(11, booking.getBookingStatus() != null ? booking.getBookingStatus() : "Pending");
            ps.setString(12, booking.getPaymentMethod() != null ? booking.getPaymentMethod() : "Cash");
            ps.setString(13, booking.getTransactionId());
            ps.setString(14, booking.getPaymentStatus() != null ? booking.getPaymentStatus() : "Unpaid");
            int rows = ps.executeUpdate();
            if (rows > 0) {
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (keys.next()) {
                        booking.setBookingId(keys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Booking> getBookingsByUser(int userId) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b " +
                     "JOIN users u ON b.user_id = u.user_id " +
                     "JOIN cars c ON b.car_id = c.car_id " +
                     "WHERE b.user_id = ? ORDER BY b.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public List<Booking> getAllBookings() {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b " +
                     "JOIN users u ON b.user_id = u.user_id " +
                     "JOIN cars c ON b.car_id = c.car_id " +
                     "ORDER BY b.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public List<Booking> getBookingsWithPagination(int offset, int limit) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b " +
                     "JOIN users u ON b.user_id = u.user_id " +
                     "JOIN cars c ON b.car_id = c.car_id " +
                     "ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public Booking getBookingById(int bookingId) {
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b " +
                     "JOIN users u ON b.user_id = u.user_id " +
                     "JOIN cars c ON b.car_id = c.car_id " +
                     "WHERE b.booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapResultSetToBooking(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean updateBookingStatus(int bookingId, String status) {
        String sql = "UPDATE bookings SET booking_status = ? WHERE booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, bookingId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updatePaymentStatus(int bookingId, String status) {
        String sql = "UPDATE bookings SET payment_status = ? WHERE booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, bookingId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updatePaymentDetails(int bookingId, String status, String transactionId) {
        String sql = "UPDATE bookings SET payment_status = ?, transaction_id = ? WHERE booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, transactionId);
            ps.setInt(3, bookingId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean refundBooking(int bookingId) {
        String sql = "UPDATE bookings SET payment_status = 'Refunded', booking_status = 'Cancelled' WHERE booking_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Filtered query for payments page */
    public List<Booking> getFilteredBookings(String payStatus, String payMethod, int offset, int limit) {
        List<Booking> bookings = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
            "FROM bookings b " +
            "JOIN users u ON b.user_id = u.user_id " +
            "JOIN cars c ON b.car_id = c.car_id WHERE 1=1");
        if (payStatus != null && !payStatus.isEmpty()) sql.append(" AND b.payment_status = ?");
        if (payMethod != null && !payMethod.isEmpty()) sql.append(" AND b.payment_method = ?");
        sql.append(" ORDER BY b.created_at DESC LIMIT ? OFFSET ?");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (payStatus != null && !payStatus.isEmpty()) ps.setString(idx++, payStatus);
            if (payMethod != null && !payMethod.isEmpty()) ps.setString(idx++, payMethod);
            ps.setInt(idx++, limit);
            ps.setInt(idx, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public int getFilteredBookingCount(String payStatus, String payMethod) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM bookings WHERE 1=1");
        if (payStatus != null && !payStatus.isEmpty()) sql.append(" AND payment_status = ?");
        if (payMethod != null && !payMethod.isEmpty()) sql.append(" AND payment_method = ?");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (payStatus != null && !payStatus.isEmpty()) ps.setString(idx++, payStatus);
            if (payMethod != null && !payMethod.isEmpty()) ps.setString(idx, payMethod);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    /** Filter by booking status for rent page tabs */
    public List<Booking> getBookingsByFilter(String filter, int offset, int limit) {
        List<Booking> bookings = new ArrayList<>();
        String whereClause;
        switch (filter == null ? "" : filter) {
            case "cash_pending": whereClause = " WHERE b.payment_method = 'Cash' AND b.booking_status = 'Pending'"; break;
            case "online_paid":  whereClause = " WHERE b.payment_method = 'Online' AND b.payment_status = 'Paid'"; break;
            case "confirmed":    whereClause = " WHERE b.booking_status = 'Confirmed'"; break;
            case "completed":    whereClause = " WHERE b.booking_status = 'Completed'"; break;
            case "cancelled":    whereClause = " WHERE b.booking_status = 'Cancelled'"; break;
            default:             whereClause = "";
        }
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN cars c ON b.car_id = c.car_id" +
                     whereClause + " ORDER BY b.created_at DESC LIMIT ? OFFSET ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    public int getBookingsByFilterCount(String filter) {
        String whereClause;
        switch (filter == null ? "" : filter) {
            case "cash_pending": whereClause = " WHERE payment_method = 'Cash' AND booking_status = 'Pending'"; break;
            case "online_paid":  whereClause = " WHERE payment_method = 'Online' AND payment_status = 'Paid'"; break;
            case "confirmed":    whereClause = " WHERE booking_status = 'Confirmed'"; break;
            case "completed":    whereClause = " WHERE booking_status = 'Completed'"; break;
            case "cancelled":    whereClause = " WHERE booking_status = 'Cancelled'"; break;
            default:             whereClause = "";
        }
        String sql = "SELECT COUNT(*) FROM bookings" + whereClause;
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getPaidCount() {
        return countByPaymentStatus("Paid");
    }
    public int getUnpaidCount() {
        return countByPaymentStatus("Unpaid");
    }
    private int countByPaymentStatus(String status) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE payment_status = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
    public int getOnlinePaymentCount() {
        String sql = "SELECT COUNT(*) FROM bookings WHERE payment_method = 'Online'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public boolean cancelBooking(int bookingId) {
        return updateBookingStatus(bookingId, "Cancelled");
    }

    public int getBookingCount() {
        String sql = "SELECT COUNT(*) FROM bookings";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getActiveBookingCount() {
        String sql = "SELECT COUNT(*) FROM bookings WHERE booking_status IN ('Pending', 'Confirmed')";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getPendingBookingCount() {
        String sql = "SELECT COUNT(*) FROM bookings WHERE booking_status = 'Pending'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public BigDecimal getTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(final_price), 0) FROM bookings WHERE booking_status IN ('Confirmed', 'Completed') AND payment_status = 'Paid'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getBigDecimal(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return BigDecimal.ZERO;
    }

    public List<Booking> getRecentBookings(int limit) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b " +
                     "JOIN users u ON b.user_id = u.user_id " +
                     "JOIN cars c ON b.car_id = c.car_id " +
                     "ORDER BY b.created_at DESC LIMIT ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }

    private Booking mapResultSetToBooking(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setBookingId(rs.getInt("booking_id"));
        b.setUserId(rs.getInt("user_id"));
        b.setCarId(rs.getInt("car_id"));
        b.setPickupLocation(rs.getString("pickup_location"));
        b.setDropLocation(rs.getString("drop_location"));
        b.setStartDate(rs.getDate("start_date"));
        b.setEndDate(rs.getDate("end_date"));
        b.setTotalDays(rs.getInt("total_days"));
        b.setTotalPrice(rs.getBigDecimal("total_price"));
        b.setDiscountAmount(rs.getBigDecimal("discount_amount"));
        b.setFinalPrice(rs.getBigDecimal("final_price"));
        b.setBookingStatus(rs.getString("booking_status"));
        b.setPaymentMethod(rs.getString("payment_method"));
        b.setTransactionId(rs.getString("transaction_id"));
        b.setPaymentStatus(rs.getString("payment_status"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        try { b.setUserName(rs.getString("user_name")); } catch (SQLException ignored) {}
        try { b.setUserEmail(rs.getString("user_email")); } catch (SQLException ignored) {}
        try { b.setCarName(rs.getString("car_name")); } catch (SQLException ignored) {}
        try { b.setCarBrand(rs.getString("car_brand")); } catch (SQLException ignored) {}
        return b;
    }

    /** Monthly revenue for last N months — returns [{month_label, revenue, count}] */
    public List<java.util.Map<String, Object>> getMonthlyRevenue(int months) {
        List<java.util.Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month_label, " +
                     "DATE_TRUNC('month', created_at) AS month_start, " +
                     "COALESCE(SUM(final_price), 0) AS revenue, COUNT(*) AS booking_count " +
                     "FROM bookings WHERE payment_status = 'Paid' " +
                     "AND created_at >= NOW() - INTERVAL '" + months + " months' " +
                     "GROUP BY month_start, month_label ORDER BY month_start ASC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("label", rs.getString("month_label"));
                row.put("revenue", rs.getBigDecimal("revenue"));
                row.put("count", rs.getInt("booking_count"));
                result.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return result;
    }

    /** Booking counts by status */
    public java.util.Map<String, Integer> getBookingCountByStatus() {
        java.util.Map<String, Integer> map = new java.util.LinkedHashMap<>();
        String sql = "SELECT booking_status, COUNT(*) AS cnt FROM bookings GROUP BY booking_status";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) map.put(rs.getString("booking_status"), rs.getInt("cnt"));
        } catch (SQLException e) { e.printStackTrace(); }
        return map;
    }

    /** Cash vs Online payment split */
    public java.util.Map<String, Integer> getPaymentMethodSplit() {
        java.util.Map<String, Integer> map = new java.util.LinkedHashMap<>();
        String sql = "SELECT COALESCE(payment_method, 'Cash') AS method, COUNT(*) AS cnt FROM bookings GROUP BY method";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) map.put(rs.getString("method"), rs.getInt("cnt"));
        } catch (SQLException e) { e.printStackTrace(); }
        return map;
    }

    /** Revenue for a given month/year (paid bookings only) */
    public java.math.BigDecimal getRevenueByMonthYear(int month, int year) {
        String sql = "SELECT COALESCE(SUM(final_price), 0) FROM bookings " +
                     "WHERE payment_status = 'Paid' AND EXTRACT(MONTH FROM created_at) = ? AND EXTRACT(YEAR FROM created_at) = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, month); ps.setInt(2, year);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getBigDecimal(1);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return java.math.BigDecimal.ZERO;
    }

    /** Yearly revenue breakdown: per month for a given year */
    public List<java.util.Map<String, Object>> getRevenueByYear(int year) {
        List<java.util.Map<String, Object>> result = new ArrayList<>();
        String sql = "SELECT EXTRACT(MONTH FROM created_at) AS mon, " +
                     "TO_CHAR(created_at, 'Mon') AS month_name, " +
                     "COALESCE(SUM(final_price), 0) AS revenue, COUNT(*) AS booking_count " +
                     "FROM bookings WHERE payment_status = 'Paid' AND EXTRACT(YEAR FROM created_at) = ? " +
                     "GROUP BY mon, month_name ORDER BY mon";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("month", (int) rs.getDouble("mon"));
                    row.put("monthName", rs.getString("month_name"));
                    row.put("revenue", rs.getBigDecimal("revenue"));
                    row.put("bookingCount", rs.getInt("booking_count"));
                    result.add(row);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return result;
    }

    /** Bookings in a date range for export */
    public List<Booking> getBookingsInDateRange(String startDate, String endDate, String payStatus, String payMethod) {
        List<Booking> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
            "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
            "FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN cars c ON b.car_id = c.car_id WHERE 1=1");
        if (startDate != null && !startDate.isEmpty()) sql.append(" AND b.created_at >= ?::date");
        if (endDate != null && !endDate.isEmpty()) sql.append(" AND b.created_at < (?::date + INTERVAL '1 day')");
        if (payStatus != null && !payStatus.isEmpty()) sql.append(" AND b.payment_status = ?");
        if (payMethod != null && !payMethod.isEmpty()) sql.append(" AND b.payment_method = ?");
        sql.append(" ORDER BY b.created_at DESC");
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            int idx = 1;
            if (startDate != null && !startDate.isEmpty()) ps.setString(idx++, startDate);
            if (endDate != null && !endDate.isEmpty()) ps.setString(idx++, endDate);
            if (payStatus != null && !payStatus.isEmpty()) ps.setString(idx++, payStatus);
            if (payMethod != null && !payMethod.isEmpty()) ps.setString(idx, payMethod);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    /** Overdue bookings: Confirmed but end_date has passed */
    public List<Booking> getOverdueBookings() {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN cars c ON b.car_id = c.car_id " +
                     "WHERE b.booking_status = 'Confirmed' AND b.end_date < CURRENT_DATE ORDER BY b.end_date ASC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) list.add(mapResultSetToBooking(rs));
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    /** Admin text search across bookings */
    public List<Booking> searchBookingsAdmin(String q) {
        List<Booking> list = new ArrayList<>();
        String kw = "%" + (q != null ? q.trim().toLowerCase() : "") + "%";
        String sql = "SELECT b.*, u.full_name AS user_name, u.email AS user_email, c.name AS car_name, c.brand AS car_brand " +
                     "FROM bookings b JOIN users u ON b.user_id = u.user_id JOIN cars c ON b.car_id = c.car_id " +
                     "WHERE LOWER(u.full_name) LIKE ? OR LOWER(u.email) LIKE ? OR CAST(b.booking_id AS TEXT) LIKE ? " +
                     "OR LOWER(c.name) LIKE ? OR LOWER(b.booking_status) LIKE ? ORDER BY b.created_at DESC LIMIT 50";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            for (int i = 1; i <= 5; i++) ps.setString(i, kw);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) list.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    /** Monthly revenue summary for payments page */
    public List<java.util.Map<String, Object>> getMonthlyRevenueSummary(int year) {
        List<java.util.Map<String,Object>> result = new ArrayList<>();
        String sql = "SELECT EXTRACT(MONTH FROM created_at) AS mon, TO_CHAR(created_at,'Mon') AS mname, " +
                     "COUNT(*) AS total, SUM(CASE WHEN payment_status='Paid' THEN 1 ELSE 0 END) AS paid_count, " +
                     "COALESCE(SUM(CASE WHEN payment_status='Paid' THEN final_price ELSE 0 END),0) AS revenue " +
                     "FROM bookings WHERE EXTRACT(YEAR FROM created_at) = ? GROUP BY mon, mname ORDER BY mon";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, year);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    java.util.Map<String,Object> row = new java.util.LinkedHashMap<>();
                    row.put("month", (int) rs.getDouble("mon"));
                    row.put("monthName", rs.getString("mname"));
                    row.put("total", rs.getInt("total"));
                    row.put("paidCount", rs.getInt("paid_count"));
                    row.put("revenue", rs.getBigDecimal("revenue"));
                    result.add(row);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return result;
    }
}

