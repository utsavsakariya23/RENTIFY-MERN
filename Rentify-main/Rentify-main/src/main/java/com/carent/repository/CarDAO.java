package com.carent.repository;

import com.carent.config.DBConnection;
import com.carent.model.Car;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CarDAO {

    public List<Car> getAllCars() {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT * FROM cars ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                cars.add(mapResultSetToCar(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cars;
    }

    public List<Car> getAvailableCars() {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT * FROM cars WHERE status = 'Available' ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                cars.add(mapResultSetToCar(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cars;
    }

    /**
     * Get cars available for specific dates (not booked and not in service).
     */
    public List<Car> getAvailableCarsForDates(Date startDate, Date endDate) {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT c.* FROM cars c WHERE c.status != 'Service' " +
                     "AND c.car_id NOT IN (" +
                     "  SELECT b.car_id FROM bookings b " +
                     "  WHERE b.booking_status IN ('Pending', 'Confirmed') " +
                     "  AND b.start_date <= ? AND b.end_date >= ?" +
                     ") ORDER BY c.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, endDate);
            ps.setDate(2, startDate);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    cars.add(mapResultSetToCar(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cars;
    }

    public Car getCarById(int carId) {
        String sql = "SELECT * FROM cars WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapResultSetToCar(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean insertCar(Car car) {
        String sql = "INSERT INTO cars (name, brand, price_per_day, fuel_type, transmission, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, car.getName());
            ps.setString(2, car.getBrand());
            ps.setBigDecimal(3, car.getPricePerDay());
            ps.setString(4, car.getFuelType());
            ps.setString(5, car.getTransmission());
            ps.setString(6, car.getImageUrl() != null ? car.getImageUrl() : "");
            ps.setString(7, car.getStatus() != null ? car.getStatus() : "Available");
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateCar(Car car) {
        String sql = "UPDATE cars SET name = ?, brand = ?, price_per_day = ?, fuel_type = ?, transmission = ?, image_url = ?, status = ? WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, car.getName());
            ps.setString(2, car.getBrand());
            ps.setBigDecimal(3, car.getPricePerDay());
            ps.setString(4, car.getFuelType());
            ps.setString(5, car.getTransmission());
            ps.setString(6, car.getImageUrl() != null ? car.getImageUrl() : "");
            ps.setString(7, car.getStatus());
            ps.setInt(8, car.getCarId());
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteCar(int carId) {
        String sql = "DELETE FROM cars WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateCarStatus(int carId, String status) {
        String sql = "UPDATE cars SET status = ? WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, carId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Car> searchCars(String keyword, String fuelType, String transmission, BigDecimal maxPrice) {
        List<Car> cars = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT * FROM cars WHERE status = 'Available'");
        List<Object> params = new ArrayList<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            sql.append(" AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ?)");
            String kw = "%" + keyword.trim().toLowerCase() + "%";
            params.add(kw);
            params.add(kw);
        }
        if (fuelType != null && !fuelType.trim().isEmpty()) {
            sql.append(" AND fuel_type = ?");
            params.add(fuelType.trim());
        }
        if (transmission != null && !transmission.trim().isEmpty()) {
            sql.append(" AND transmission = ?");
            params.add(transmission.trim());
        }
        if (maxPrice != null) {
            sql.append(" AND price_per_day <= ?");
            params.add(maxPrice);
        }
        sql.append(" ORDER BY created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                Object p = params.get(i);
                if (p instanceof String) ps.setString(i + 1, (String) p);
                else if (p instanceof BigDecimal) ps.setBigDecimal(i + 1, (BigDecimal) p);
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    cars.add(mapResultSetToCar(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cars;
    }

    public List<Car> getCarsWithPagination(int offset, int limit) {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT * FROM cars ORDER BY created_at DESC LIMIT ? OFFSET ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            ps.setInt(2, offset);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    cars.add(mapResultSetToCar(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return cars;
    }

    public int getCarCount() {
        String sql = "SELECT COUNT(*) FROM cars";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }

    public int getActiveCarCount() {
        String sql = "SELECT COUNT(*) FROM cars WHERE status = 'Available'";
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
     * Check if a specific car is available for specific dates.
     */
    public boolean isCarAvailable(int carId, Date startDate, Date endDate) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE car_id = ? " +
                     "AND booking_status IN ('Pending', 'Confirmed') " +
                     "AND start_date <= ? AND end_date >= ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, carId);
            ps.setDate(2, endDate);
            ps.setDate(3, startDate);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return rs.getInt(1) == 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Car> searchCarsAdmin(String q) {
        List<Car> cars = new ArrayList<>();
        String kw = "%" + (q != null ? q.trim().toLowerCase() : "") + "%";
        String sql = "SELECT * FROM cars WHERE LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR LOWER(status) LIKE ? ORDER BY created_at DESC LIMIT 50";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, kw); ps.setString(2, kw); ps.setString(3, kw);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) cars.add(mapResultSetToCar(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return cars;
    }

    public boolean updateFleetInfo(int carId, java.sql.Date lastService, java.sql.Date nextService, java.sql.Date insuranceExpiry, Integer mileage) {
        String sql = "UPDATE cars SET last_service_date = ?, next_service_date = ?, insurance_expiry = ?, mileage = ? WHERE car_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, lastService);
            ps.setDate(2, nextService);
            ps.setDate(3, insuranceExpiry);
            if (mileage != null) ps.setInt(4, mileage); else ps.setNull(4, Types.INTEGER);
            ps.setInt(5, carId);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); }
        return false;
    }

    public List<Car> getAllCarsForFleet() {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT c.*, (SELECT COUNT(*) FROM bookings b WHERE b.car_id = c.car_id) AS total_bookings FROM cars c ORDER BY c.name";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                Car car = mapResultSetToCar(rs);
                try { car.setTotalBookings(rs.getInt("total_bookings")); } catch (SQLException ignored) {}
                cars.add(car);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return cars;
    }

    /** Returns top N most booked cars */
    public List<Car> getTopRentedCars(int limit) {
        List<Car> cars = new ArrayList<>();
        String sql = "SELECT c.*, COUNT(b.booking_id) AS total_bookings FROM cars c " +
                     "LEFT JOIN bookings b ON c.car_id = b.car_id AND b.booking_status != 'Cancelled' " +
                     "GROUP BY c.car_id ORDER BY total_bookings DESC LIMIT ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, limit);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Car car = mapResultSetToCar(rs);
                    car.setTotalBookings(rs.getInt("total_bookings"));
                    cars.add(car);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return cars;
    }

    private Car mapResultSetToCar(ResultSet rs) throws SQLException {
        Car car = new Car();
        car.setCarId(rs.getInt("car_id"));
        car.setName(rs.getString("name"));
        car.setBrand(rs.getString("brand"));
        car.setPricePerDay(rs.getBigDecimal("price_per_day"));
        car.setFuelType(rs.getString("fuel_type"));
        car.setTransmission(rs.getString("transmission"));
        car.setImageUrl(rs.getString("image_url"));
        car.setStatus(rs.getString("status"));
        car.setCreatedAt(rs.getTimestamp("created_at"));
        try { car.setLastServiceDate(rs.getDate("last_service_date")); } catch (SQLException ignored) {}
        try { car.setNextServiceDate(rs.getDate("next_service_date")); } catch (SQLException ignored) {}
        try { car.setInsuranceExpiry(rs.getDate("insurance_expiry")); } catch (SQLException ignored) {}
        try { int m = rs.getInt("mileage"); if (!rs.wasNull()) car.setMileage(m); } catch (SQLException ignored) {}
        return car;
    }
}

