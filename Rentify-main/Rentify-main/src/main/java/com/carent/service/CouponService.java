package com.carent.service;

import com.carent.model.Coupon;
import com.carent.repository.CouponDAO;

import java.util.List;

public class CouponService {
    private final CouponDAO couponDAO = new CouponDAO();

    /**
     * Validate coupon: exists + not expired + active.
     */
    public Coupon validateCoupon(String code) {
        if (code == null || code.trim().isEmpty()) return null;
        return couponDAO.validateCoupon(code.trim());
    }

    public List<Coupon> getAllCoupons() {
        return couponDAO.getAllCoupons();
    }

    public boolean addCoupon(Coupon coupon) {
        return couponDAO.insertCoupon(coupon);
    }

    public boolean updateCoupon(Coupon coupon) {
        return couponDAO.updateCoupon(coupon);
    }

    public boolean deleteCoupon(int couponId) {
        return couponDAO.deleteCoupon(couponId);
    }

    public Coupon getCouponById(int couponId) {
        return couponDAO.getCouponById(couponId);
    }
}
