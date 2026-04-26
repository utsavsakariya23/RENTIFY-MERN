package com.carent.repository;

import com.carent.config.DBConnection;
import com.carent.model.Coupon;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CouponDAO {

    public Coupon validateCoupon(String code) {
        String sql = "SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = TRUE AND expiry_date >= CURRENT_DATE";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, code);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapResultSetToCoupon(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Coupon> getAllCoupons() {
        List<Coupon> coupons = new ArrayList<>();
        String sql = "SELECT * FROM coupons ORDER BY coupon_id DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                coupons.add(mapResultSetToCoupon(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return coupons;
    }

    public boolean insertCoupon(Coupon coupon) {
        String sql = "INSERT INTO coupons (code, discount_percentage, expiry_date, is_active) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, coupon.getCode().toUpperCase());
            ps.setBigDecimal(2, coupon.getDiscountPercentage());
            ps.setDate(3, coupon.getExpiryDate());
            ps.setBoolean(4, coupon.isActive());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateCoupon(Coupon coupon) {
        String sql = "UPDATE coupons SET code = ?, discount_percentage = ?, expiry_date = ?, is_active = ? WHERE coupon_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, coupon.getCode().toUpperCase());
            ps.setBigDecimal(2, coupon.getDiscountPercentage());
            ps.setDate(3, coupon.getExpiryDate());
            ps.setBoolean(4, coupon.isActive());
            ps.setInt(5, coupon.getCouponId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteCoupon(int couponId) {
        String sql = "DELETE FROM coupons WHERE coupon_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, couponId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public Coupon getCouponById(int couponId) {
        String sql = "SELECT * FROM coupons WHERE coupon_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, couponId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapResultSetToCoupon(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    private Coupon mapResultSetToCoupon(ResultSet rs) throws SQLException {
        Coupon c = new Coupon();
        c.setCouponId(rs.getInt("coupon_id"));
        c.setCode(rs.getString("code"));
        c.setDiscountPercentage(rs.getBigDecimal("discount_percentage"));
        c.setExpiryDate(rs.getDate("expiry_date"));
        c.setActive(rs.getBoolean("is_active"));
        return c;
    }
}
