package com.carent.controller;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import com.carent.model.*;
import com.carent.repository.UserDAO;
import com.carent.repository.ContactMessageDAO;
import com.carent.service.OTPService;
import com.carent.service.EmailService;
import com.carent.service.*;

public class PageController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private static final int PAGE_SIZE = 5;

    private UserDAO userDAO = new UserDAO();
    private CarService carService = new CarService();
    private BookingService bookingService = new BookingService();
    private CouponService couponService = new CouponService();
    private ReviewService reviewService = new ReviewService();
    private NotificationService notificationService = new NotificationService();
    private ContactMessageDAO contactMessageDAO = new ContactMessageDAO();
    private OTPService otpService = new OTPService();
    private EmailService emailService = new EmailService();
    private FinanceService financeService = new FinanceService();
    private com.carent.repository.CarDAO carDAO = new com.carent.repository.CarDAO();

    @Override
    public void init() throws ServletException {
        System.out.println("--- PageController INITIALIZED ---");
        try {
            com.carent.DBDbUpdate.main(null);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getRequestURI();
        if (request.getContextPath() != null && !request.getContextPath().isEmpty()) {
            action = action.substring(request.getContextPath().length());
        }

        // Normalize path
        if (action.length() > 1 && action.endsWith("/")) {
            action = action.substring(0, action.length() - 1);
        }

        // Protect Admin Routes
        if (action.startsWith("/admin")) {
            HttpSession sess = request.getSession(false);
            if (sess == null || sess.getAttribute("loggedUser") == null) {
                response.sendRedirect(request.getContextPath() + "/login?error=true");
                return;
            }
            User u = (User) sess.getAttribute("loggedUser");
            if (!"Admin".equalsIgnoreCase(u.getRole())) {
                response.sendRedirect(request.getContextPath() + "/home");
                return;
            }
        }

        // Handle root path
        if (action.equals("") || action.equals("/")) {
            request.getRequestDispatcher("/WEB-INF/views/home.jsp").forward(request, response);
            return;
        }

        // Get pagination parameter
        int page = 1;
        try {
            String pageStr = request.getParameter("page");
            if (pageStr != null) page = Integer.parseInt(pageStr);
            if (page < 1) page = 1;
        } catch (NumberFormatException ignored) {}

        switch (action) {
            case "/home":
                // Load featured cars for homepage
                List<Car> featuredCars = carService.getAvailableCars();
                request.setAttribute("featuredCars", featuredCars);
                request.getRequestDispatcher("/WEB-INF/views/home.jsp").forward(request, response);
                break;

            case "/vehicles":
                // Load cars with optional search filters
                String keyword = request.getParameter("keyword");
                String fuelType = request.getParameter("fuelType");
                String transmission = request.getParameter("transmission");
                String maxPriceStr = request.getParameter("maxPrice");
                BigDecimal maxPrice = null;
                if (maxPriceStr != null && !maxPriceStr.isEmpty()) {
                    try { maxPrice = new BigDecimal(maxPriceStr); } catch (Exception ignored) {}
                }

                List<Car> cars;
                if (keyword != null || fuelType != null || transmission != null || maxPrice != null) {
                    cars = carService.searchCars(keyword, fuelType, transmission, maxPrice);
                } else {
                    cars = carService.getAvailableCars();
                }
                request.setAttribute("cars", cars);
                request.setAttribute("carCount", cars.size());
                request.getRequestDispatcher("/WEB-INF/views/vehicles.jsp").forward(request, response);
                break;

            case "/contact":
                request.getRequestDispatcher("/WEB-INF/views/contact.jsp").forward(request, response);
                break;

            case "/about":
                request.getRequestDispatcher("/WEB-INF/views/about.jsp").forward(request, response);
                break;

            case "/login":
                if (request.getSession(false) != null && request.getSession(false).getAttribute("loggedUser") != null) {
                    User u = (User) request.getSession(false).getAttribute("loggedUser");
                    if ("Admin".equalsIgnoreCase(u.getRole())) {
                        response.sendRedirect(request.getContextPath() + "/admin/dashboard");
                    } else {
                        response.sendRedirect(request.getContextPath() + "/home");
                    }
                    return;
                }
                request.getRequestDispatcher("/WEB-INF/views/login.jsp").forward(request, response);
                break;

            case "/register":
                request.getRequestDispatcher("/WEB-INF/views/register.jsp").forward(request, response);
                break;

            case "/car_info":
                String carIdStr = request.getParameter("id");
                if (carIdStr != null) {
                    try {
                        int carId = Integer.parseInt(carIdStr);
                        Car car = carService.getCarById(carId);
                        if (car != null) {
                            List<Review> carReviews = reviewService.getReviewsByCarId(carId);
                            request.setAttribute("car", car);
                            request.setAttribute("reviews", carReviews);
                        }
                    } catch (NumberFormatException ignored) {}
                }
                request.getRequestDispatcher("/WEB-INF/views/car_info.jsp").forward(request, response);
                break;

            case "/profile":
                if (request.getSession(false) == null || request.getSession(false).getAttribute("loggedUser") == null) {
                    response.sendRedirect(request.getContextPath() + "/login?error=true");
                    return;
                }
                User profileUser = (User) request.getSession(false).getAttribute("loggedUser");
                List<Booking> allProfileBookings = bookingService.getBookingsByUser(profileUser.getUserId());
                
                long currTime = System.currentTimeMillis();
                List<Booking> upcomingBookings = new java.util.ArrayList<>();
                List<Booking> pastBookings = new java.util.ArrayList<>();
                
                for (Booking b : allProfileBookings) {
                    // Check if the booking is currently active/upcoming (Pending/Confirmed and end_date >= today)
                    if (("Pending".equals(b.getBookingStatus()) || "Confirmed".equals(b.getBookingStatus())) && b.getEndDate().getTime() >= currTime - 86400000L) {
                        upcomingBookings.add(b);
                    } else {
                        pastBookings.add(b);
                        // Add can review attribute for past completed bookings
                        boolean canReview = "Completed".equals(b.getBookingStatus()) && !reviewService.hasReviewForBooking(b.getBookingId());
                        request.setAttribute("canReview_" + b.getBookingId(), canReview);
                    }
                }
                
                request.setAttribute("upcomingBookings", upcomingBookings);
                request.setAttribute("pastBookings", pastBookings);
                
                // Fetch valid notifications for the user
                List<Notification> userNotifications = notificationService.getNotificationsByUserId(profileUser.getUserId());
                request.setAttribute("userNotifications", userNotifications);
                
                request.getRequestDispatcher("/WEB-INF/views/profile.jsp").forward(request, response);
                break;

            case "/my_bookings":
                if (request.getSession(false) == null || request.getSession(false).getAttribute("loggedUser") == null) {
                    response.sendRedirect(request.getContextPath() + "/login?error=true");
                    return;
                }
                User bookingUser = (User) request.getSession(false).getAttribute("loggedUser");
                List<Booking> userBookings = bookingService.getBookingsByUser(bookingUser.getUserId());
                // Check review eligibility for each booking
                for (Booking b : userBookings) {
                    boolean canReview = "Completed".equals(b.getBookingStatus()) && !reviewService.hasReviewForBooking(b.getBookingId());
                    request.setAttribute("canReview_" + b.getBookingId(), canReview);
                }
                request.setAttribute("bookings", userBookings);
                request.getRequestDispatcher("/WEB-INF/views/my_bookings.jsp").forward(request, response);
                break;

            case "/booking":
                if (request.getSession(false) == null || request.getSession(false).getAttribute("loggedUser") == null) {
                    response.sendRedirect(request.getContextPath() + "/login?error=true");
                    return;
                }
                String bookCarIdStr = request.getParameter("carId");
                if (bookCarIdStr != null) {
                    try {
                        Car bookCar = carService.getCarById(Integer.parseInt(bookCarIdStr));
                        request.setAttribute("car", bookCar);
                    } catch (NumberFormatException ignored) {}
                }
                request.getRequestDispatcher("/WEB-INF/views/booking.jsp").forward(request, response);
                break;

            case "/logout":
                HttpSession sess = request.getSession(false);
                if (sess != null) {
                    sess.invalidate();
                }
                Cookie clearCookie = new Cookie("rememberUser", "");
                clearCookie.setMaxAge(0);
                clearCookie.setPath("/");
                response.addCookie(clearCookie);
                response.sendRedirect(request.getContextPath() + "/login?logout=true");
                break;

            // ====== Admin Routes ======
            case "/admin/dashboard":
                request.setAttribute("totalUsers", userDAO.getCustomerCount());
                request.setAttribute("totalBookings", bookingService.getBookingCount());
                request.setAttribute("totalRevenue", bookingService.getTotalRevenue());
                request.setAttribute("activeCars", carService.getActiveCarCount());
                request.setAttribute("totalCars", carService.getCarCount());
                request.setAttribute("pendingBookings", bookingService.getPendingBookingCount());
                request.setAttribute("recentBookings", bookingService.getRecentBookings(5));
                request.setAttribute("overdueBookings", bookingService.getOverdueBookings());
                request.setAttribute("unreadMessages", contactMessageDAO.getUnreadCount());
                request.getRequestDispatcher("/WEB-INF/views/admin/dashboard.jsp").forward(request, response);
                break;

            case "/admin/vehicles":
                List<Car> adminCars = carService.getCarsWithPagination(page, PAGE_SIZE);
                int totalCars = carService.getCarCount();
                request.setAttribute("cars", adminCars);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalCars / PAGE_SIZE));
                request.getRequestDispatcher("/WEB-INF/views/admin/vehicles.jsp").forward(request, response);
                break;

            case "/admin/rent": {
                String rentFilter = request.getParameter("filter");
                List<Booking> adminBookings = bookingService.getBookingsByFilter(rentFilter, page, PAGE_SIZE);
                int totalBookingsFiltered = bookingService.getBookingsByFilterCount(rentFilter);
                request.setAttribute("bookings", adminBookings);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalBookingsFiltered / PAGE_SIZE));
                request.setAttribute("pendingCount", bookingService.getPendingBookingCount());
                request.setAttribute("confirmedCount", bookingService.getBookingsByFilterCount("confirmed"));
                request.getRequestDispatcher("/WEB-INF/views/admin/rentrequest.jsp").forward(request, response);
                break;
            }

            case "/admin/payments": {
                String payStatus = request.getParameter("payStatus");
                String payMethod = request.getParameter("payMethod");
                List<Booking> adminPaymentsList = bookingService.getFilteredPayments(payStatus, payMethod, page, PAGE_SIZE);
                int adminTotalPaymentsCount = bookingService.getFilteredPaymentCount(payStatus, payMethod);
                request.setAttribute("payments", adminPaymentsList);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) adminTotalPaymentsCount / PAGE_SIZE));
                // KPI stats
                request.setAttribute("totalRevenue", bookingService.getTotalRevenue());
                request.setAttribute("paidCount", bookingService.getPaidCount());
                request.setAttribute("unpaidCount", bookingService.getUnpaidCount());
                request.setAttribute("onlineCount", bookingService.getOnlinePaymentCount());
                request.getRequestDispatcher("/WEB-INF/views/admin/payments.jsp").forward(request, response);
                break;
            }

            case "/admin/customers":
                List<User> adminUsers = userDAO.getUsersWithPagination((page - 1) * PAGE_SIZE, PAGE_SIZE);
                int totalUsers = userDAO.getUserCount();
                request.setAttribute("users", adminUsers);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalUsers / PAGE_SIZE));
                request.getRequestDispatcher("/WEB-INF/views/admin/customers.jsp").forward(request, response);
                break;

            case "/admin/coupons":
                List<Coupon> coupons = couponService.getAllCoupons();
                request.setAttribute("coupons", coupons);
                request.getRequestDispatcher("/WEB-INF/views/admin/coupons.jsp").forward(request, response);
                break;

            case "/admin/messages":
                List<ContactMessage> messages = contactMessageDAO.getMessagesWithPagination((page - 1) * PAGE_SIZE, PAGE_SIZE);
                int totalMessages = contactMessageDAO.getMessageCount();
                request.setAttribute("messages", messages);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalMessages / PAGE_SIZE));
                request.getRequestDispatcher("/WEB-INF/views/admin/messages.jsp").forward(request, response);
                break;

            case "/admin/notifications":
                List<Notification> notifications = notificationService.getNotificationsWithPagination(page, PAGE_SIZE);
                int totalNotifications = notificationService.getNotificationCount();
                request.setAttribute("notifications", notifications);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalNotifications / PAGE_SIZE));
                request.getRequestDispatcher("/WEB-INF/views/admin/notifications.jsp").forward(request, response);
                break;

            case "/admin/profile":
                request.getRequestDispatcher("/WEB-INF/views/admin/profile.jsp").forward(request, response);
                break;

            case "/admin/reviews": {
                List<Review> reviews = reviewService.getReviewsWithPagination(page, PAGE_SIZE);
                int totalReviews = reviewService.getTotalReviewCount();
                request.setAttribute("reviews", reviews);
                request.setAttribute("currentPage", page);
                request.setAttribute("totalPages", (int) Math.ceil((double) totalReviews / PAGE_SIZE));
                request.getRequestDispatcher("/WEB-INF/views/admin/reviews.jsp").forward(request, response);
                break;
            }

            // ====== New Feature Routes ======
            case "/admin/analytics": {
                request.setAttribute("monthlyRevenue", bookingService.getMonthlyRevenue(12));
                request.setAttribute("bookingStatusCounts", bookingService.getBookingCountByStatus());
                request.setAttribute("paymentMethodSplit", bookingService.getPaymentMethodSplit());
                request.setAttribute("topRentedCars", carDAO.getTopRentedCars(5));
                request.setAttribute("topCustomers", userDAO.getTopCustomers(5));
                request.setAttribute("totalRevenue", bookingService.getTotalRevenue());
                request.setAttribute("totalBookings", bookingService.getBookingCount());
                request.getRequestDispatcher("/WEB-INF/views/admin/analytics.jsp").forward(request, response);
                break;
            }

            case "/admin/finance": {
                int finYear;
                try { finYear = Integer.parseInt(request.getParameter("year")); } catch (Exception e) { finYear = java.time.Year.now().getValue(); }
                request.setAttribute("selectedYear", finYear);
                request.setAttribute("yearlySummary", financeService.getYearlySummary(finYear));
                request.setAttribute("quarterlyGST", financeService.getQuarterlyGST(finYear));
                // Current month statement
                java.time.LocalDate now = java.time.LocalDate.now();
                request.setAttribute("currentMonthStmt", financeService.getMonthlyStatement(now.getMonthValue(), now.getYear()));
                request.setAttribute("currentMonth", now.getMonth().getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH));
                request.setAttribute("currentYear", now.getYear());
                request.setAttribute("gstRate", financeService.getGstRate());
                request.getRequestDispatcher("/WEB-INF/views/admin/finance.jsp").forward(request, response);
                break;
            }

            case "/admin/fleet":
                request.setAttribute("fleetCars", carDAO.getAllCarsForFleet());
                request.getRequestDispatcher("/WEB-INF/views/admin/fleet.jsp").forward(request, response);
                break;

            case "/admin/settings":
                request.getRequestDispatcher("/WEB-INF/views/admin/settings.jsp").forward(request, response);
                break;

            case "/invoice": {
                HttpSession invSession = request.getSession(false);
                if (invSession == null || invSession.getAttribute("loggedUser") == null) {
                    response.sendRedirect(request.getContextPath() + "/login"); return;
                }
                String bidStr = request.getParameter("bookingId");
                if (bidStr != null) {
                    try {
                        Booking inv = bookingService.getBookingById(Integer.parseInt(bidStr));
                        User invUser = (User) invSession.getAttribute("loggedUser");
                        // Security: only own booking or admin
                        if (inv != null && (inv.getUserId() == invUser.getUserId() || "Admin".equalsIgnoreCase(invUser.getRole()))) {
                            request.setAttribute("booking", inv);
                        }
                    } catch (NumberFormatException ignored) {}
                }
                request.getRequestDispatcher("/WEB-INF/views/invoice.jsp").forward(request, response);
                break;
            }

            default:
                if (action.startsWith("/admin")) {
                    request.getRequestDispatcher("/WEB-INF/views/admin/dashboard.jsp").forward(request, response);
                } else {
                    request.getRequestDispatcher("/WEB-INF/views/home.jsp").forward(request, response);
                }
                break;
        }
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String action = request.getRequestURI();
        if (request.getContextPath() != null && !request.getContextPath().isEmpty()) {
            action = action.substring(request.getContextPath().length());
        }

        if (action.equals("/perform_login")) {
            handleLogin(request, response);
        } else if (action.equals("/perform_register")) {
            handleRegister(request, response);
        } else if (action.equals("/update_profile")) {
            handleUpdateProfile(request, response);
        } else if (action.equals("/change_password")) {
            handleChangePassword(request, response);
        } else if (action.equals("/validate_unique")) {
            handleValidateUnique(request, response);
        } else if (action.equals("/send_otp")) {
            handleSendOTP(request, response);
        } else if (action.equals("/verify_otp")) {
            handleVerifyOTP(request, response);
        } else {
            doGet(request, response);
        }
    }

    private void handleValidateUnique(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String field = request.getParameter("field");
        String value = request.getParameter("value");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        boolean taken = false;
        if (value != null && !value.trim().isEmpty()) {
            value = value.trim();
            if ("username".equals(field)) {
                taken = userDAO.isUsernameTaken(value);
            } else if ("email".equals(field)) {
                taken = userDAO.isEmailTaken(value);
            } else if ("licenseNo".equals(field)) {
                taken = userDAO.isLicenseNoTaken(value);
            }
        }

        response.getWriter().write("{\"taken\": " + taken + "}");
    }

    private void handleLogin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String rememberMe = request.getParameter("rememberMe");

        boolean isAjax = "XMLHttpRequest".equals(request.getHeader("X-Requested-With"));

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            if (isAjax) {
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"message\": \"Username/Email and Password are required.\"}");
            } else {
                response.sendRedirect(request.getContextPath() + "/login?error=true");
            }
            return;
        }

        User user = userDAO.getUserByUsernameAndPassword(username.trim(), password);

        if (user != null) {
            HttpSession session = request.getSession(true);
            session.setAttribute("loggedUser", user);
            session.setAttribute("user", user.getUsername());
            session.setAttribute("role", user.getRole());
            session.setMaxInactiveInterval(30 * 60);

            if ("on".equals(rememberMe)) {
                Cookie cookie = new Cookie("rememberUser", user.getUsername());
                cookie.setMaxAge(30 * 24 * 60 * 60);
                cookie.setPath("/");
                response.addCookie(cookie);
            } else {
                Cookie cookie = new Cookie("rememberUser", "");
                cookie.setMaxAge(0);
                cookie.setPath("/");
                response.addCookie(cookie);
            }

            String targetUrl = "Admin".equalsIgnoreCase(user.getRole()) ? "/admin/dashboard" : "/home";
            if (isAjax) {
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": true, \"redirectUrl\": \"" + request.getContextPath() + targetUrl + "\"}");
            } else {
                response.sendRedirect(request.getContextPath() + targetUrl);
            }
        } else {
            if (isAjax) {
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"message\": \"Invalid username or password.\"}");
            } else {
                response.sendRedirect(request.getContextPath() + "/login?error=true");
            }
        }
    }

    /**
     * AJAX: Send OTP to the provided email.
     */
    private void handleSendOTP(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String email = request.getParameter("email");

        if (email == null || email.trim().isEmpty()) {
            response.getWriter().write("{\"success\": false, \"message\": \"Email is required.\"}");
            return;
        }

        email = email.trim();

        // Check if email is already registered
        if (userDAO.isEmailTaken(email)) {
            response.getWriter().write("{\"success\": false, \"message\": \"This email is already registered.\"}");
            return;
        }

        // Generate and send OTP
        String otp = otpService.generateOTP(email);
        emailService.sendOTPEmail(email, otp);

        response.getWriter().write("{\"success\": true, \"message\": \"OTP sent to " + email + ". Check your inbox.\"}");
    }

    /**
     * AJAX: Verify OTP code.
     */
    private void handleVerifyOTP(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String email = request.getParameter("email");
        String otp = request.getParameter("otp");

        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            response.getWriter().write("{\"success\": false, \"message\": \"Email and OTP are required.\"}");
            return;
        }

        boolean valid = otpService.verifyOTP(email.trim(), otp.trim());

        if (valid) {
            // Store verified email in session for registration validation
            HttpSession session = request.getSession(true);
            session.setAttribute("otpVerifiedEmail", email.trim().toLowerCase());
            response.getWriter().write("{\"success\": true, \"message\": \"Email verified successfully!\"}");
        } else {
            response.getWriter().write("{\"success\": false, \"message\": \"Invalid or expired OTP. Please try again.\"}");
        }
    }

    /**
     * AJAX Registration with OTP pre-verification.
     */
    private void handleRegister(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String fullName = request.getParameter("fullName");
        String email = request.getParameter("email");
        String phone = request.getParameter("phone");
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");
        String licenseNo = request.getParameter("licenseNo");

        // Validate required fields
        if (fullName == null || fullName.trim().isEmpty()
                || email == null || email.trim().isEmpty()
                || username == null || username.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {
            response.getWriter().write("{\"success\": false, \"message\": \"All required fields must be filled.\"}");
            return;
        }

        if (!password.equals(confirmPassword)) {
            response.getWriter().write("{\"success\": false, \"message\": \"Passwords do not match.\"}");
            return;
        }

        // Verify OTP was completed for this email
        HttpSession session = request.getSession(false);
        String verifiedEmail = session != null ? (String) session.getAttribute("otpVerifiedEmail") : null;
        if (verifiedEmail == null || !verifiedEmail.equals(email.trim().toLowerCase())) {
            response.getWriter().write("{\"success\": false, \"message\": \"Please verify your email with OTP first.\"}");
            return;
        }

        if (userDAO.isUsernameTaken(username.trim())) {
            response.getWriter().write("{\"success\": false, \"message\": \"Username is already taken.\"}");
            return;
        }

        if (userDAO.isEmailTaken(email.trim())) {
            response.getWriter().write("{\"success\": false, \"message\": \"Email is already registered.\"}");
            return;
        }

        String hashedPassword = com.carent.util.PasswordUtil.hashPassword(password);

        User user = new User(fullName.trim(), email.trim(),
                phone != null ? phone.trim() : "",
                username.trim(), hashedPassword,
                licenseNo != null ? licenseNo.trim() : "");
        user.setVerified(true); // OTP-verified email

        String dbError = userDAO.insertUser(user);

        if (dbError == null) {
            // Clear OTP session data
            if (session != null) session.removeAttribute("otpVerifiedEmail");
            response.getWriter().write("{\"success\": true, \"message\": \"Account created successfully! You can now login.\"}");
        } else {
            response.getWriter().write("{\"success\": false, \"message\": \"Registration failed: " +
                    dbError.replace("\"", "'") + "\"}" );
        }
    }

    private void handleUpdateProfile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login?error=true");
            return;
        }

        User currentUser = (User) session.getAttribute("loggedUser");

        String fullName = request.getParameter("fullName");
        String phone = request.getParameter("phone");
        String licenseNo = request.getParameter("licenseNo");

        if (fullName == null || fullName.trim().isEmpty() || phone == null || phone.trim().isEmpty()) {
            response.sendRedirect(request.getContextPath() + "/profile?error=profile_failed");
            return;
        }

        currentUser.setFullName(fullName.trim());
        currentUser.setPhone(phone.trim());
        if (licenseNo != null) currentUser.setLicenseNo(licenseNo.trim());

        boolean success = userDAO.updateUser(currentUser);

        if (success) {
            session.setAttribute("loggedUser", currentUser);
            response.sendRedirect(request.getContextPath() + "/profile?success=profile_updated");
        } else {
            response.sendRedirect(request.getContextPath() + "/profile?error=profile_failed");
        }
    }

    private void handleChangePassword(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login?error=true");
            return;
        }

        User currentUser = (User) session.getAttribute("loggedUser");

        String currentPassword = request.getParameter("currentPassword");
        String newPassword = request.getParameter("newPassword");
        String confirmNewPassword = request.getParameter("confirmNewPassword");

        if (currentPassword == null || newPassword == null || confirmNewPassword == null ||
            currentPassword.trim().isEmpty() || newPassword.trim().isEmpty() || confirmNewPassword.trim().isEmpty()) {
            response.sendRedirect(request.getContextPath() + "/profile?error=password_failed");
            return;
        }

        if (!newPassword.equals(confirmNewPassword)) {
            response.sendRedirect(request.getContextPath() + "/profile?error=password_mismatch");
            return;
        }

        if (!com.carent.util.PasswordUtil.verifyPassword(currentPassword, currentUser.getPassword())) {
            response.sendRedirect(request.getContextPath() + "/profile?error=wrong_password");
            return;
        }

        String newHash = com.carent.util.PasswordUtil.hashPassword(newPassword);

        boolean success = userDAO.updatePassword(currentUser.getUserId(), newHash);

        if (success) {
            currentUser.setPassword(newHash);
            session.setAttribute("loggedUser", currentUser);
            response.sendRedirect(request.getContextPath() + "/profile?success=password_changed");
        } else {
            response.sendRedirect(request.getContextPath() + "/profile?error=password_failed");
        }
    }
}
