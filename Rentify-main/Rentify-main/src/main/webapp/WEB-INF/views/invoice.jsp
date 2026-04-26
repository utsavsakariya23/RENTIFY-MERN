<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice #RENT-${booking.bookingId} — Carent</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; }
        .invoice-wrapper { max-width: 800px; margin: 2rem auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
        .invoice-header { background: linear-gradient(135deg, #0d6efd, #0a58ca); color: white; padding: 2.5rem; }
        .invoice-body { padding: 2rem; }
        .invoice-title { font-size: 2rem; font-weight: 800; letter-spacing: -1px; }
        .invoice-meta { font-size: 0.85rem; opacity: 0.85; }
        .line-item { border-bottom: 1px solid #e9ecef; padding: 0.75rem 0; }
        .total-row { font-size: 1.2rem; font-weight: 700; border-top: 2px solid #0d6efd; padding-top: 1rem; margin-top: 1rem; }
        .gst-info { font-size: 0.8rem; color: #6c757d; }
        .paid-stamp { display: inline-block; border: 3px solid #198754; color: #198754; font-weight: 900; font-size: 1.4rem; padding: 0.25rem 1rem; border-radius: 8px; transform: rotate(-5deg); letter-spacing: 2px; }
        .unpaid-stamp { display: inline-block; border: 3px solid #dc3545; color: #dc3545; font-weight: 900; font-size: 1.4rem; padding: 0.25rem 1rem; border-radius: 8px; transform: rotate(-5deg); letter-spacing: 2px; }
        @media print {
            body { background: white; }
            .no-print { display: none !important; }
            .invoice-wrapper { box-shadow: none; margin: 0; border-radius: 0; }
        }
    </style>
</head>
<body>

<div class="no-print text-center py-3" style="background: #0d6efd;">
    <button onclick="window.print()" class="btn btn-light me-2"><i class="fas fa-print me-1"></i>Print Invoice</button>
    <a href="${pageContext.request.contextPath}/profile" class="btn btn-outline-light">← Back</a>
</div>

<div class="invoice-wrapper" id="printArea">
    <!-- Header -->
    <div class="invoice-header">
        <div class="row align-items-center">
            <div class="col">
                <div class="invoice-title">🚗 CARENT</div>
                <div class="invoice-meta">Car Rental Services | GST No: 24XXXXX0001Z1</div>
                <div class="invoice-meta">123, Auto Nagar, Surat, Gujarat — 395006</div>
                <div class="invoice-meta">Email: support@carent.in | Ph: +91 98765 43210</div>
            </div>
            <div class="col-auto text-end">
                <div style="font-size: 0.9rem; opacity: 0.8;">TAX INVOICE</div>
                <div style="font-size: 1.8rem; font-weight: 800;">#RENT-${booking.bookingId}</div>
                <div style="font-size: 0.85rem; opacity: 0.8;">Date: <fmt:formatDate value="${booking.createdAt}" pattern="dd MMM yyyy"/></div>
            </div>
        </div>
    </div>

    <c:choose>
        <c:when test="${empty booking}">
            <div class="invoice-body text-center py-5">
                <h4 class="text-danger">Invoice Not Found</h4>
                <p class="text-muted">The booking you are looking for does not exist or you don't have access to it.</p>
                <a href="${pageContext.request.contextPath}/my_bookings" class="btn btn-primary">← My Bookings</a>
            </div>
        </c:when>
        <c:otherwise>
            <div class="invoice-body">
                <!-- Bill To & Booking Details -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <h6 class="fw-bold text-muted text-uppercase small">Bill To</h6>
                        <div class="fw-bold fs-5">${booking.userName}</div>
                        <div class="text-muted">${booking.userEmail}</div>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <h6 class="fw-bold text-muted text-uppercase small">Booking Reference</h6>
                        <div class="fw-bold">#RENT-${booking.bookingId}</div>
                        <div class="text-muted small">Status: <strong>${booking.bookingStatus}</strong></div>
                    </div>
                </div>

                <!-- Vehicle Details -->
                <div class="p-3 rounded mb-4" style="background: #f8f9fa;">
                    <h6 class="fw-bold text-muted text-uppercase small mb-2">Vehicle Details</h6>
                    <div class="row">
                        <div class="col-md-6">
                            <strong>${booking.carBrand} ${booking.carName}</strong>
                        </div>
                        <div class="col-md-3 text-md-center">
                            <i class="fas fa-map-marker-alt text-success"></i> ${empty booking.pickupLocation ? 'N/A' : booking.pickupLocation}
                        </div>
                        <div class="col-md-3 text-md-end">
                            <i class="fas fa-map-marker-alt text-danger"></i> ${empty booking.dropLocation ? 'N/A' : booking.dropLocation}
                        </div>
                    </div>
                </div>

                <!-- Line Items -->
                <div class="line-item d-flex justify-content-between">
                    <div>Rental — ${booking.totalDays} day(s) × Base Rate</div>
                    <div>
                        <fmt:parseNumber var="pricePerDay" value="${booking.totalDays > 0 ? booking.totalPrice / booking.totalDays : booking.totalPrice}" integerOnly="false"/>
                        Rs. <fmt:formatNumber value="${booking.totalDays > 0 ? booking.totalPrice / booking.totalDays : booking.totalPrice}" pattern="#,##0"/> × ${booking.totalDays} days
                    </div>
                </div>
                <div class="line-item d-flex justify-content-between">
                    <div>
                        <i class="fas fa-calendar-alt me-1 text-primary"></i>Pickup: <fmt:formatDate value="${booking.startDate}" pattern="dd MMM yyyy"/>
                        &nbsp;→&nbsp;Drop: <fmt:formatDate value="${booking.endDate}" pattern="dd MMM yyyy"/>
                    </div>
                    <div class="text-muted">—</div>
                </div>
                <c:if test="${booking.discountAmount != null && booking.discountAmount > 0}">
                    <div class="line-item d-flex justify-content-between text-success">
                        <div><i class="fas fa-tag me-1"></i>Coupon Discount</div>
                        <div>- Rs. <fmt:formatNumber value="${booking.discountAmount}" pattern="#,##0"/></div>
                    </div>
                </c:if>
                <div class="line-item d-flex justify-content-between text-muted">
                    <div>Sub-Total (Excl. GST)</div>
                    <%-- GST INCLUSIVE calculation: base = total * 100/118 --%>
                    <div>Rs. <fmt:formatNumber value="${booking.finalPrice * 100 / 118}" pattern="#,##0.00"/></div>
                </div>
                <div class="line-item d-flex justify-content-between text-danger">
                    <div>GST @ 18% (CGST 9% + SGST 9%)</div>
                    <div>Rs. <fmt:formatNumber value="${booking.finalPrice * 18 / 118}" pattern="#,##0.00"/></div>
                </div>
                <div class="total-row d-flex justify-content-between">
                    <div>TOTAL AMOUNT</div>
                    <div class="text-primary">Rs. <fmt:formatNumber value="${booking.finalPrice}" pattern="#,##0"/></div>
                </div>

                <!-- Payment Info -->
                <div class="row mt-4">
                    <div class="col-md-8">
                        <h6 class="fw-bold text-muted text-uppercase small">Payment Information</h6>
                        <div class="small">Method: <strong>${empty booking.paymentMethod ? 'Cash' : booking.paymentMethod}</strong></div>
                        <c:if test="${not empty booking.transactionId}">
                            <div class="small">Transaction ID: <code>${booking.transactionId}</code></div>
                        </c:if>
                        <div class="gst-info mt-2">* GST is inclusive in the total amount. This is a computer-generated invoice.</div>
                    </div>
                    <div class="col-md-4 text-end">
                        <c:choose>
                            <c:when test="${booking.paymentStatus == 'Paid'}">
                                <div class="paid-stamp">PAID ✓</div>
                            </c:when>
                            <c:otherwise>
                                <div class="unpaid-stamp">UNPAID</div>
                            </c:otherwise>
                        </c:choose>
                    </div>
                </div>

                <!-- Footer -->
                <div class="text-center mt-4 pt-3 border-top">
                    <p class="text-muted small mb-0">Thank you for choosing Carent! For support, email support@carent.in or call +91 98765 43210.</p>
                    <p class="text-muted small">This invoice is subject to our <a href="#" class="text-muted">Terms & Conditions</a>.</p>
                </div>
            </div>
        </c:otherwise>
    </c:choose>
</div>

<script>
    // Auto-print when page loads (optional — comment out if you don't want auto-print)
    // window.onload = function() { window.print(); };
</script>
</body>
</html>
