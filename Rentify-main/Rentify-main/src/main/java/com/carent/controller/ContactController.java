package com.carent.controller;

import com.carent.model.ContactMessage;
import com.carent.model.User;
import com.carent.repository.ContactMessageDAO;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

public class ContactController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final ContactMessageDAO contactDAO = new ContactMessageDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String name = request.getParameter("name");
        String email = request.getParameter("email");
        String subject = request.getParameter("subject");
        String message = request.getParameter("message");

        if (name == null || name.trim().isEmpty() ||
            email == null || email.trim().isEmpty() ||
            message == null || message.trim().isEmpty()) {
            response.sendRedirect(request.getContextPath() + "/contact?error=empty_fields");
            return;
        }

        ContactMessage msg = new ContactMessage();
        msg.setName(name.trim());
        msg.setEmail(email.trim());
        msg.setSubject(subject != null ? subject.trim() : "");
        msg.setMessage(message.trim());

        // If user is logged in, link the message
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("loggedUser") != null) {
            User user = (User) session.getAttribute("loggedUser");
            msg.setUserId(user.getUserId());
        }

        boolean success = contactDAO.insertMessage(msg);
        if (success) {
            response.sendRedirect(request.getContextPath() + "/contact?success=message_sent");
        } else {
            response.sendRedirect(request.getContextPath() + "/contact?error=send_failed");
        }
    }
}
