package com.carent.service;

import com.carent.model.Car;
import com.carent.repository.CarDAO;
import com.carent.repository.ReviewDAO;

import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;

public class CarService {
    private final CarDAO carDAO = new CarDAO();
    private final ReviewDAO reviewDAO = new ReviewDAO();

    public List<Car> getAllCars() {
        return carDAO.getAllCars();
    }

    public List<Car> getAvailableCars() {
        List<Car> cars = carDAO.getAvailableCars();
        enrichWithRatings(cars);
        return cars;
    }

    public List<Car> getAvailableCarsForDates(Date startDate, Date endDate) {
        List<Car> cars = carDAO.getAvailableCarsForDates(startDate, endDate);
        enrichWithRatings(cars);
        return cars;
    }

    public Car getCarById(int carId) {
        Car car = carDAO.getCarById(carId);
        if (car != null) {
            car.setAverageRating(reviewDAO.getAverageRating(carId));
            car.setReviewCount(reviewDAO.getReviewCount(carId));
        }
        return car;
    }

    public boolean addCar(Car car) {
        return carDAO.insertCar(car);
    }

    public boolean updateCar(Car car) {
        return carDAO.updateCar(car);
    }

    public boolean deleteCar(int carId) {
        return carDAO.deleteCar(carId);
    }

    public boolean updateCarStatus(int carId, String status) {
        return carDAO.updateCarStatus(carId, status);
    }

    public List<Car> searchCars(String keyword, String fuelType, String transmission, BigDecimal maxPrice) {
        List<Car> cars = carDAO.searchCars(keyword, fuelType, transmission, maxPrice);
        enrichWithRatings(cars);
        return cars;
    }

    public List<Car> getCarsWithPagination(int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return carDAO.getCarsWithPagination(offset, pageSize);
    }

    public int getCarCount() {
        return carDAO.getCarCount();
    }

    public int getActiveCarCount() {
        return carDAO.getActiveCarCount();
    }

    public boolean isCarAvailable(int carId, Date startDate, Date endDate) {
        Car car = carDAO.getCarById(carId);
        if (car == null || "Service".equals(car.getStatus())) return false;
        return carDAO.isCarAvailable(carId, startDate, endDate);
    }

    private void enrichWithRatings(List<Car> cars) {
        for (Car car : cars) {
            car.setAverageRating(reviewDAO.getAverageRating(car.getCarId()));
            car.setReviewCount(reviewDAO.getReviewCount(car.getCarId()));
        }
    }
}
