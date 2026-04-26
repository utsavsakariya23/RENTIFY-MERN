package com.carent.service;

import com.carent.repository.BookingDAO;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

public class FinanceService {

    private static final BigDecimal GST_RATE = new BigDecimal("18");  // 18%
    private final BookingDAO bookingDAO = new BookingDAO();

    public BigDecimal getGstRate() { return GST_RATE; }

    /**
     * Monthly income statement for a given month/year.
     * Returns: grossRevenue, gstCollected, netRevenue (after GST)
     */
    public Map<String, BigDecimal> getMonthlyStatement(int month, int year) {
        Map<String, BigDecimal> stmt = new LinkedHashMap<>();
        BigDecimal gross = bookingDAO.getRevenueByMonthYear(month, year);
        // GST-inclusive: gross = baseAmount * (1 + 18/100), so GST = gross * 18/118
        BigDecimal gst = gross.multiply(GST_RATE)
                              .divide(BigDecimal.valueOf(100).add(GST_RATE), 2, RoundingMode.HALF_UP);
        BigDecimal net = gross.subtract(gst);
        stmt.put("grossRevenue", gross);
        stmt.put("gstCollected", gst);
        stmt.put("netRevenue", net);
        return stmt;
    }

    /**
     * Yearly income summary per month.
     */
    public List<Map<String, Object>> getYearlySummary(int year) {
        List<Map<String, Object>> base = bookingDAO.getRevenueByYear(year);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : base) {
            BigDecimal rev = (BigDecimal) row.get("revenue");
            BigDecimal gst = rev.multiply(GST_RATE)
                               .divide(BigDecimal.valueOf(100).add(GST_RATE), 2, RoundingMode.HALF_UP);
            BigDecimal net = rev.subtract(gst);
            Map<String, Object> r = new LinkedHashMap<>(row);
            r.put("gst", gst);
            r.put("netRevenue", net);
            result.add(r);
        }
        return result;
    }

    /**
     * Quarterly GST totals for a given year.
     */
    public Map<String, BigDecimal> getQuarterlyGST(int year) {
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        List<Map<String, Object>> yearly = bookingDAO.getRevenueByYear(year);
        BigDecimal[] quarters = {BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO};
        for (Map<String, Object> row : yearly) {
            int mon = (int) row.get("month");
            BigDecimal rev = (BigDecimal) row.get("revenue");
            BigDecimal gst = rev.multiply(GST_RATE)
                               .divide(BigDecimal.valueOf(100).add(GST_RATE), 2, RoundingMode.HALF_UP);
            int q = (mon - 1) / 3;
            quarters[q] = quarters[q].add(gst);
        }
        result.put("Q1 (Jan-Mar)", quarters[0]);
        result.put("Q2 (Apr-Jun)", quarters[1]);
        result.put("Q3 (Jul-Sep)", quarters[2]);
        result.put("Q4 (Oct-Dec)", quarters[3]);
        return result;
    }

    public List<Map<String, Object>> getMonthlyRevenueSummary(int year) {
        return bookingDAO.getMonthlyRevenueSummary(year);
    }
}
