package com.carent;

import com.carent.config.DBConnection;
import java.sql.Connection;
import java.sql.Statement;

public class DBDbUpdate {
    public static void main(String[] args) {
        System.out.println("--- Starting Database Migration ---");
        try (Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement()) {

            // 1. Notifications: Add user_id
            try {
                stmt.executeUpdate(
                        "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(user_id) ON DELETE CASCADE");
                System.out.println("SUCCESS: notifications.user_id added or already exists.");
            } catch (Exception e) {
                System.out.println("INFO: notifications migration check: " + e.getMessage());
            }
            // 2. Bookings: Add pickup_location and drop_location
            try {
                stmt.executeUpdate("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(200)");
                stmt.executeUpdate("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS drop_location VARCHAR(200)");
                System.out.println("SUCCESS: bookings location columns added or already exist.");
            } catch (Exception e) {
                System.out.println("INFO: bookings migration check: " + e.getMessage());
            }
            // 3. Users: Add id_url and license_url (Safe-guard since UserDAO also does
            // this)
            try {
                stmt.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_url TEXT");
                stmt.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS license_url TEXT");
                System.out.println("SUCCESS: users document columns added or already exist.");
            } catch (Exception e) {
                System.out.println("INFO: users migration check: " + e.getMessage());
            }
            System.out.println("--- Database Migration Completed ---");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
