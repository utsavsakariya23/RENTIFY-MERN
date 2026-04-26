package test;

import com.carent.config.DBConnection;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.Statement;

public class DBMigrationTest {

    @Test
    public void executeMigrations() {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Executing: ALTER TABLE users ADD COLUMN id_url text");
            try {
                stmt.execute("ALTER TABLE users ADD COLUMN id_url text");
            } catch (Exception e) {
                System.out.println("Column id_url may already exist: " + e.getMessage());
            }

            System.out.println("Executing: ALTER TABLE users ADD COLUMN license_url text");
            try {
                stmt.execute("ALTER TABLE users ADD COLUMN license_url text");
            } catch (Exception e) {
                System.out.println("Column license_url may already exist: " + e.getMessage());
            }

            System.out.println("Migration complete!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
