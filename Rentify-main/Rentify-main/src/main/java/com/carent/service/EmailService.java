package com.carent.service;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Async email service using Jakarta Mail (SMTP).
 * Configure your Gmail credentials below.
 */
public class EmailService {

    // TODO: Replace with your Gmail credentials
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final int SMTP_PORT = 587;
    private static final String SMTP_USERNAME = "utsavsakariya05@gmail.com";
    private static final String SMTP_PASSWORD = "hagjxnnclseqjdwn";
    private static final String FROM_NAME = "Carent Car Rental";

    private static final ExecutorService executor = Executors.newFixedThreadPool(3);

    private Session getMailSession() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", SMTP_HOST);
        props.put("mail.smtp.port", String.valueOf(SMTP_PORT));
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");

        return Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SMTP_USERNAME, SMTP_PASSWORD);
            }
        });
    }

    /**
     * Send email asynchronously.
     */
    public void sendEmailAsync(String to, String subject, String body) {
        executor.submit(() -> {
            try {
                sendEmail(to, subject, body);
            } catch (Exception e) {
                System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            }
        });
    }

    /**
     * Send bulk email with BCC for notifications.
     */
    public void sendBulkEmailAsync(List<String> toList, String subject, String body) {
        executor.submit(() -> {
            try {
                Session session = getMailSession();
                Message message = new MimeMessage(session);
                message.setFrom(new InternetAddress(SMTP_USERNAME, FROM_NAME));
                message.setSubject(subject);
                message.setContent(buildHtmlBody(body), "text/html; charset=utf-8");

                for (String email : toList) {
                    message.addRecipient(Message.RecipientType.BCC, new InternetAddress(email));
                }

                Transport.send(message);
                System.out.println("Bulk email sent to " + toList.size() + " recipients.");
            } catch (Exception e) {
                System.err.println("Failed to send bulk email: " + e.getMessage());
            }
        });
    }

    /**
     * Send single email synchronously.
     */
    public void sendEmail(String to, String subject, String body) throws MessagingException {
        try {
            Session session = getMailSession();
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SMTP_USERNAME, FROM_NAME));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject);
            message.setContent(buildHtmlBody(body), "text/html; charset=utf-8");
            Transport.send(message);
            System.out.println("Email sent to " + to);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
    }

    /**
     * Send booking confirmation email.
     */
    public void sendBookingConfirmation(String to, String customerName, String carName,
            String startDate, String endDate, String finalPrice) {
        String subject = "Booking Confirmation - Carent Car Rental";
        String body = "<h2>Booking Confirmed!</h2>" +
                "<p>Dear " + customerName + ",</p>" +
                "<p>Your booking has been received successfully.</p>" +
                "<table style='border-collapse: collapse; width: 100%;'>" +
                "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Car</strong></td>" +
                "<td style='padding: 8px; border: 1px solid #ddd;'>" + carName + "</td></tr>" +
                "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Start Date</strong></td>" +
                "<td style='padding: 8px; border: 1px solid #ddd;'>" + startDate + "</td></tr>" +
                "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>End Date</strong></td>" +
                "<td style='padding: 8px; border: 1px solid #ddd;'>" + endDate + "</td></tr>" +
                "<tr><td style='padding: 8px; border: 1px solid #ddd;'><strong>Total Price</strong></td>" +
                "<td style='padding: 8px; border: 1px solid #ddd;'>Rs. " + finalPrice + "</td></tr>" +
                "</table>" +
                "<p>Thank you for choosing Carent!</p>";
        sendEmailAsync(to, subject, body);
    }

    /**
     * Send contact reply email.
     */
    public void sendContactReply(String to, String name, String originalSubject, String replyMessage) {
        String subject = "Re: " + originalSubject + " - Carent Support";
        String body = "<h2>Response to your inquiry</h2>" +
                "<p>Dear " + name + ",</p>" +
                "<p>" + replyMessage.replace("\n", "<br>") + "</p>" +
                "<p>Best regards,<br>Carent Support Team</p>";
        sendEmailAsync(to, subject, body);
    }

    /**
     * Send OTP verification email for registration.
     */
    public void sendOTPEmail(String to, String otp) {
        String subject = "Your Verification Code - Rentify";
        String body = "<h2 style='text-align: center; color: #333;'>Email Verification</h2>" +
                      "<p style='text-align: center; color: #666;'>Use the following code to verify your email address:</p>" +
                      "<div style='text-align: center; margin: 30px 0;'>" +
                      "<div style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); " +
                      "color: white; font-size: 32px; font-weight: bold; letter-spacing: 12px; padding: 20px 40px; " +
                      "border-radius: 12px; font-family: monospace;'>" + otp + "</div></div>" +
                      "<p style='text-align: center; color: #999; font-size: 14px;'>" +
                      "This code expires in <strong>5 minutes</strong>. Do not share it with anyone.</p>" +
                      "<p style='text-align: center; color: #999; font-size: 12px;'>" +
                      "If you didn't request this, please ignore this email.</p>";
        sendEmailAsync(to, subject, body);
    }

    private String buildHtmlBody(String content) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>"
                +
                "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;'>"
                +
                "<h1 style='color: white; margin: 0; text-align: center;'>Carent</h1></div>" +
                "<div style='background: white; padding: 30px; border: 1px solid #eee; border-radius: 0 0 10px 10px;'>"
                +
                content +
                "</div></body></html>";
    }
}
