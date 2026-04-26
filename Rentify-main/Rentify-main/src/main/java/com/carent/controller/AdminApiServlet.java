package com.carent.controller;

import com.carent.model.Booking;
import com.carent.model.Car;
import com.carent.model.User;
import com.carent.repository.BookingDAO;
import com.carent.repository.CarDAO;
import com.carent.repository.UserDAO;

import com.carent.repository.ContactMessageDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

/**
 * AJAX API endpoints for admin live search.
 * All routes under /admin/api/*
 */
@WebServlet(urlPatterns = {"/admin/api/search_vehicles", "/admin/api/search_customers", "/admin/api/search_bookings", "/admin/api/unread_count"})
public class AdminApiServlet extends HttpServlet {

    private final CarDAO carDAO = new CarDAO();
    private final UserDAO userDAO = new UserDAO();
    private final BookingDAO bookingDAO = new BookingDAO();
    private final ContactMessageDAO msgDAO = new ContactMessageDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // Security: must be admin
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            resp.setStatus(401);
            return;
        }
        User u = (User) session.getAttribute("loggedUser");
        if (!"Admin".equalsIgnoreCase(u.getRole())) {
            resp.setStatus(403);
            return;
        }

        resp.setContentType("application/json; charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");
        String path = req.getServletPath();
        String q = req.getParameter("q");
        PrintWriter out = resp.getWriter();

        switch (path) {
            case "/admin/api/search_vehicles":
                handleSearchVehicles(q, out);
                break;
            case "/admin/api/search_customers":
                handleSearchCustomers(q, out);
                break;
            case "/admin/api/search_bookings":
                handleSearchBookings(q, out);
                break;
            case "/admin/api/unread_count":
                out.print("{\"count\":" + msgDAO.getUnreadCount() + "}");
                break;
            default:
                resp.setStatus(404);
        }
    }

    private void handleSearchVehicles(String q, PrintWriter out) {
        List<Car> cars = carDAO.searchCarsAdmin(q);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < cars.size(); i++) {
            Car c = cars.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
              .append("\"carId\":").append(c.getCarId()).append(",")
              .append("\"name\":").append(json(c.getName())).append(",")
              .append("\"brand\":").append(json(c.getBrand())).append(",")
              .append("\"pricePerDay\":").append(c.getPricePerDay()).append(",")
              .append("\"fuelType\":").append(json(c.getFuelType())).append(",")
              .append("\"transmission\":").append(json(c.getTransmission())).append(",")
              .append("\"status\":").append(json(c.getStatus())).append(",")
              .append("\"imageUrl\":").append(json(c.getImageUrl() != null ? c.getImageUrl() : ""))
              .append("}");
        }
        sb.append("]");
        out.print(sb);
    }

    private void handleSearchCustomers(String q, PrintWriter out) {
        List<User> users = userDAO.searchCustomers(q);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < users.size(); i++) {
            User u = users.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
              .append("\"userId\":").append(u.getUserId()).append(",")
              .append("\"fullName\":").append(json(u.getFullName())).append(",")
              .append("\"email\":").append(json(u.getEmail())).append(",")
              .append("\"phone\":").append(json(u.getPhone() != null ? u.getPhone() : "")).append(",")
              .append("\"username\":").append(json(u.getUsername())).append(",")
              .append("\"licenseNo\":").append(json(u.getLicenseNo() != null ? u.getLicenseNo() : "")).append(",")
              .append("\"role\":").append(json(u.getRole())).append(",")
              .append("\"verified\":").append(u.isVerified())
              .append("}");
        }
        sb.append("]");
        out.print(sb);
    }

    private void handleSearchBookings(String q, PrintWriter out) {
        List<Booking> bookings = bookingDAO.searchBookingsAdmin(q);
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < bookings.size(); i++) {
            Booking b = bookings.get(i);
            if (i > 0) sb.append(",");
            sb.append("{")
              .append("\"bookingId\":").append(b.getBookingId()).append(",")
              .append("\"userName\":").append(json(b.getUserName() != null ? b.getUserName() : "")).append(",")
              .append("\"userEmail\":").append(json(b.getUserEmail() != null ? b.getUserEmail() : "")).append(",")
              .append("\"carName\":").append(json((b.getCarBrand() != null ? b.getCarBrand() : "") + " " + (b.getCarName() != null ? b.getCarName() : ""))).append(",")
              .append("\"startDate\":").append(json(b.getStartDate() != null ? b.getStartDate().toString() : "")).append(",")
              .append("\"endDate\":").append(json(b.getEndDate() != null ? b.getEndDate().toString() : "")).append(",")
              .append("\"totalDays\":").append(b.getTotalDays()).append(",")
              .append("\"finalPrice\":").append(b.getFinalPrice()).append(",")
              .append("\"paymentMethod\":").append(json(b.getPaymentMethod() != null ? b.getPaymentMethod() : "Cash")).append(",")
              .append("\"paymentStatus\":").append(json(b.getPaymentStatus())).append(",")
              .append("\"bookingStatus\":").append(json(b.getBookingStatus()))
              .append("}");
        }
        sb.append("]");
        out.print(sb);
    }

    private String json(String s) {
        if (s == null) return "\"\"";
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"")
                       .replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }
}
