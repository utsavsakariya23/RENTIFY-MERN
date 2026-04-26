package com.carent.model;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;

public class Car {
    private int carId;
    private String name;
    private String brand;
    private BigDecimal pricePerDay;
    private String fuelType;
    private String transmission;
    private String imageUrl;
    private String status;
    private Timestamp createdAt;

    // Fleet management fields
    private Date lastServiceDate;
    private Date nextServiceDate;
    private Date insuranceExpiry;
    private Integer mileage;

    // Transient fields for display
    private double averageRating;
    private int reviewCount;
    private int totalBookings;

    public Car() {}

    public Car(String name, String brand, BigDecimal pricePerDay, String fuelType, String transmission, String imageUrl) {
        this.name = name;
        this.brand = brand;
        this.pricePerDay = pricePerDay;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.imageUrl = imageUrl;
        this.status = "Available";
    }

    public int getCarId() { return carId; }
    public void setCarId(int carId) { this.carId = carId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }
    public String getFuelType() { return fuelType; }
    public void setFuelType(String fuelType) { this.fuelType = fuelType; }
    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    public Date getLastServiceDate() { return lastServiceDate; }
    public void setLastServiceDate(Date lastServiceDate) { this.lastServiceDate = lastServiceDate; }
    public Date getNextServiceDate() { return nextServiceDate; }
    public void setNextServiceDate(Date nextServiceDate) { this.nextServiceDate = nextServiceDate; }
    public Date getInsuranceExpiry() { return insuranceExpiry; }
    public void setInsuranceExpiry(Date insuranceExpiry) { this.insuranceExpiry = insuranceExpiry; }
    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }
    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }
    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }
}
