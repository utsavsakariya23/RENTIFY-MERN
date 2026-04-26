package com.carent.repository;

import com.carent.config.DBConnection;
import java.sql.*;

public class OtpDAO {

    public void saveOTP(String email, String otp) {
        String sql = "INSERT INTO otps (email, otp, created_at) VALUES (?, ?, CURRENT_TIMESTAMP) " +
                     "ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, created_at = CURRENT_TIMESTAMP";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            stmt.setString(2, otp);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public String getOTP(String email) {
        String sql = "SELECT otp FROM otps WHERE email = ? AND created_at > (CURRENT_TIMESTAMP - INTERVAL '5 minutes')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getString("otp");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void deleteOTP(String email) {
        String sql = "DELETE FROM otps WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void cleanupExpiredOTPs() {
        String sql = "DELETE FROM otps WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '5 minutes')";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
