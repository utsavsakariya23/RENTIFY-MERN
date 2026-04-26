package com.carent.service;

import com.carent.repository.OtpDAO;
import java.security.SecureRandom;

/**
 * OTP generation, storage, and verification service.
 * OTPs are now stored in the database for better persistence.
 */
public class OTPService {

    private static final int OTP_LENGTH = 6;
    private static final SecureRandom random = new SecureRandom();
    private final OtpDAO otpDAO = new OtpDAO();

    /**
     * Generate a 6-digit OTP, store it in the database, and return it.
     */
    public String generateOTP(String email) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        String otp = sb.toString();
        otpDAO.saveOTP(email.toLowerCase().trim(), otp);
        return otp;
    }

    /**
     * Verify OTP for the given email. Returns true if valid and not expired.
     * Removes the OTP after successful verification (one-time use).
     */
    public boolean verifyOTP(String email, String otp) {
        if (email == null || otp == null) return false;
        String key = email.toLowerCase().trim();
        String storedOTP = otpDAO.getOTP(key);
        
        if (storedOTP != null && storedOTP.equals(otp.trim())) {
            otpDAO.deleteOTP(key); // one-time use
            return true;
        }
        return false;
    }

    /**
     * Clear expired OTPs from the database.
     */
    public void cleanupExpired() {
        otpDAO.cleanupExpiredOTPs();
    }
}
