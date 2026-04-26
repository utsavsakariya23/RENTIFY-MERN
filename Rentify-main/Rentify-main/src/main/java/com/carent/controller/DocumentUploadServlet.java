package com.carent.controller;

import com.carent.model.User;
import com.carent.repository.UserDAO;
import com.carent.service.CloudinaryService;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.io.InputStream;

@MultipartConfig(
    fileSizeThreshold = 0,
    maxFileSize = 10485760, // 10 MB
    maxRequestSize = 20971520 // 20 MB
)
public class DocumentUploadServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    
    private final CloudinaryService cloudinaryService = new CloudinaryService();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("loggedUser") == null) {
            response.getWriter().write("{\"success\": false, \"message\": \"Not authenticated.\"}");
            return;
        }

        User currentUser = (User) session.getAttribute("loggedUser");
        String currentIdUrl = currentUser.getIdUrl();
        String currentLicenseUrl = currentUser.getLicenseUrl();

        try {
            Part idPart = request.getPart("idFile");
            if (idPart != null && idPart.getSize() > 0) {
                try (InputStream is = idPart.getInputStream()) {
                    String url = cloudinaryService.uploadImage(is, "documents/id");
                    if (url != null) currentIdUrl = url;
                }
            }

            Part licensePart = request.getPart("licenseFile");
            if (licensePart != null && licensePart.getSize() > 0) {
                try (InputStream is = licensePart.getInputStream()) {
                    String url = cloudinaryService.uploadImage(is, "documents/license");
                    if (url != null) currentLicenseUrl = url;
                }
            }
            
            if (currentIdUrl != null || currentLicenseUrl != null) {
                boolean updated = userDAO.updateUserDocuments(currentUser.getUserId(), currentIdUrl, currentLicenseUrl);
                if (updated) {
                    currentUser.setIdUrl(currentIdUrl);
                    currentUser.setLicenseUrl(currentLicenseUrl);
                    session.setAttribute("loggedUser", currentUser); // update session
                    response.getWriter().write("{\"success\": true, \"message\": \"Documents uploaded successfully!\", \"idUrl\": \"" + (currentIdUrl != null ? currentIdUrl : "") + "\", \"licenseUrl\": \"" + (currentLicenseUrl != null ? currentLicenseUrl : "") + "\"}");
                } else {
                    response.getWriter().write("{\"success\": false, \"message\": \"Database update failed.\"}");
                }
            } else {
                response.getWriter().write("{\"success\": false, \"message\": \"No files were uploaded.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred during upload.\"}");
        }
    }
}
