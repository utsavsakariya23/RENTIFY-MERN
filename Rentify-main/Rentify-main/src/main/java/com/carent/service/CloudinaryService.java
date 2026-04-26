package com.carent.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import java.io.InputStream;
import java.util.Map;

/**
 * Cloudinary image upload service.
 * Configure your credentials below.
 */
public class CloudinaryService {

    // TODO: Replace with your Cloudinary credentials
    private static final String CLOUD_NAME = "doij5izb5";
    private static final String API_KEY = "314754773984842";
    private static final String API_SECRET = "ECzXavmH4BohOB1t0xb4j6dpBj8";
    private static Cloudinary cloudinary;

    static {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", CLOUD_NAME,
                "api_key", API_KEY,
                "api_secret", API_SECRET,
                "secure", true));
    }

    /**
     * Upload image from InputStream.
     * Returns the secure URL of the uploaded image.
     */
    @SuppressWarnings("unchecked")
    public String uploadImage(InputStream inputStream, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    inputStream.readAllBytes(),
                    ObjectUtils.asMap(
                            "folder", "carent/" + folder,
                            "resource_type", "auto"));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            System.err.println("Cloudinary upload failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * Upload image from byte array.
     */
    @SuppressWarnings("unchecked")
    public String uploadImage(byte[] imageBytes, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    imageBytes,
                    ObjectUtils.asMap(
                            "folder", "carent/" + folder,
                            "resource_type", "auto"));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            System.err.println("Cloudinary upload failed: " + e.getMessage());
            return null;
        }
    }

    /**
     * Delete image by public ID.
     */
    public boolean deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            return true;
        } catch (Exception e) {
            System.err.println("Cloudinary delete failed: " + e.getMessage());
            return false;
        }
    }
}
