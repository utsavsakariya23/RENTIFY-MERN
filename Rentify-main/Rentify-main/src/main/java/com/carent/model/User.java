package com.carent.model;

import java.sql.Timestamp;

/**
 * Model class representing a user in the system.
 * Maps to the "users" table in PostgreSQL.
 */
public class User {

    private int userId;
    private String fullName;
    private String email;
    private String phone;
    private String username;
    private String password;
    private String licenseNo;
    private String role;
    private boolean isVerified;
    private Timestamp createdAt;
    private String idUrl;
    private String licenseUrl;

    // Default constructor
    public User() {}

    // Constructor for registration
    public User(String fullName, String email, String phone, String username, String password, String licenseNo) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.username = username;
        this.password = password;
        this.licenseNo = licenseNo;
        this.role = "Customer";
        this.isVerified = false;
    }

    // Getters and Setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { this.isVerified = verified; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "User{userId=" + userId + ", username='" + username + "', role='" + role + "', verified=" + isVerified + "}";
    }

    public String getIdUrl() { return idUrl; }
    public void setIdUrl(String idUrl) { this.idUrl = idUrl; }

    public String getLicenseUrl() { return licenseUrl; }
    public void setLicenseUrl(String licenseUrl) { this.licenseUrl = licenseUrl; }
}
