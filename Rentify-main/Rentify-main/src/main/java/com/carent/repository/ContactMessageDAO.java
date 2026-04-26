package com.carent.repository;

import com.carent.config.DBConnection;
import com.carent.model.ContactMessage;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ContactMessageDAO {

    public boolean insertMessage(ContactMessage msg) {
        String sql = "INSERT INTO contact_messages (user_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (msg.getUserId() != null) {
                ps.setInt(1, msg.getUserId());
            } else {
                ps.setNull(1, Types.INTEGER);
            }
            ps.setString(2, msg.getName());
            ps.setString(3, msg.getEmail());
            ps.setString(4, msg.getSubject());
            ps.setString(5, msg.getMessage());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<ContactMessage> getAllMessages() {
        List<ContactMessage> messages = new ArrayList<>();
        String sql = "SELECT cm.*, u.full_name AS user_name FROM contact_messages cm " +
                     "LEFT JOIN users u ON cm.user_id = u.user_id " +
                     "ORDER BY cm.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                messages.add(mapResultSetToContactMessage(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return messages;
    }

    public List<ContactMessage> getMessagesWithPagination(int offset, int limit) {
        List<ContactMessage> messages = new ArrayList<>();
        String sql = "SELECT cm.*, u.full_name AS user_name FROM contact_messages cm " +
                     "LEFT JOIN users u ON cm.user_id = u.user_id " +
                     "ORDER BY cm.created_at DESC LIMIT ? OFFSET ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    messages.add(mapResultSetToContactMessage(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return messages;
    }

    public ContactMessage getMessageById(int messageId) {
        String sql = "SELECT cm.*, u.full_name AS user_name FROM contact_messages cm " +
                     "LEFT JOIN users u ON cm.user_id = u.user_id " +
                     "WHERE cm.message_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, messageId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapResultSetToContactMessage(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean replyToMessage(int messageId, String reply) {
        String sql = "UPDATE contact_messages SET reply = ?, status = 'Replied' WHERE message_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, reply);
            ps.setInt(2, messageId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateStatus(int messageId, String status) {
        String sql = "UPDATE contact_messages SET status = ? WHERE message_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, messageId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteMessage(int messageId) {
        String sql = "DELETE FROM contact_messages WHERE message_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, messageId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public int getMessageCount() {
        String sql = "SELECT COUNT(*) FROM contact_messages";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getUnreadMessageCount() {
        String sql = "SELECT COUNT(*) FROM contact_messages WHERE status = 'Unread'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    private ContactMessage mapResultSetToContactMessage(ResultSet rs) throws SQLException {
        ContactMessage m = new ContactMessage();
        m.setMessageId(rs.getInt("message_id"));
        int uid = rs.getInt("user_id");
        m.setUserId(rs.wasNull() ? null : uid);
        m.setName(rs.getString("name"));
        m.setEmail(rs.getString("email"));
        m.setSubject(rs.getString("subject"));
        m.setMessage(rs.getString("message"));
        m.setReply(rs.getString("reply"));
        m.setStatus(rs.getString("status"));
        m.setCreatedAt(rs.getTimestamp("created_at"));
        try { m.setUserName(rs.getString("user_name")); } catch (SQLException ignored) {}
        return m;
    }

    public int getUnreadCount() {
        String sql = "SELECT COUNT(*) FROM contact_messages WHERE status = 'Unread'";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) { e.printStackTrace(); }
        return 0;
    }
}

