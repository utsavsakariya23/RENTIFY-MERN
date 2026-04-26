package com.carent.service;

import com.carent.model.Notification;
import com.carent.repository.NotificationDAO;
import com.carent.repository.UserDAO;

import java.util.List;

public class NotificationService {
    private final NotificationDAO notificationDAO = new NotificationDAO();
    private final UserDAO userDAO = new UserDAO();

    public boolean sendNotification(String message, boolean sendEmail) {
        boolean saved = false;
        List<com.carent.model.User> allUsers = userDAO.getAllUsers();
        for (com.carent.model.User u : allUsers) {
            saved = notificationDAO.insertNotification(u.getUserId(), message) || saved;
        }

        if (saved && sendEmail) {
            // Send email to all customers asynchronously
            List<String> emails = userDAO.getAllCustomerEmails();
            if (!emails.isEmpty()) {
                EmailService emailService = new EmailService();
                emailService.sendBulkEmailAsync(emails, "Carent Notification", message);
            }
        }
        return saved;
    }

    public List<Notification> getAllNotifications() {
        return notificationDAO.getAllNotifications();
    }

    public List<Notification> getNotificationsByUserId(int userId) {
        return notificationDAO.getNotificationsByUserId(userId);
    }

    public List<Notification> getLatestNotifications(int limit) {
        return notificationDAO.getLatestNotifications(limit);
    }

    public List<Notification> getNotificationsWithPagination(int page, int pageSize) {
        int offset = (page - 1) * pageSize;
        return notificationDAO.getNotificationsWithPagination(offset, pageSize);
    }

    public int getNotificationCount() {
        return notificationDAO.getNotificationCount();
    }

    public boolean deleteNotification(int notificationId) {
        return notificationDAO.deleteNotification(notificationId);
    }
}
