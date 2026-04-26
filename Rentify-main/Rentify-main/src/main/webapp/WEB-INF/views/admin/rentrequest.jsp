<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold mb-0">Rent Requests / Bookings</h2>
                <div class="d-flex gap-2">
                    <span class="badge bg-warning text-dark fs-6 p-2">${pendingCount} Pending</span>
                    <span class="badge bg-success fs-6 p-2">${confirmedCount} Confirmed</span>
                </div>
            </div>

            <c:if test="${not empty param.success}">
                <div class="alert alert-success alert-dismissible fade show"><i class="fas fa-check me-2"></i>${param.success}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
            </c:if>

            <!-- Filter Tabs -->
            <ul class="nav nav-pills mb-3 flex-wrap gap-1">
                <li class="nav-item"><a class="nav-link ${empty param.filter ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent">All</a></li>
                <li class="nav-item"><a class="nav-link ${param.filter == 'cash_pending' ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent?filter=cash_pending">Cash Pending</a></li>
                <li class="nav-item"><a class="nav-link ${param.filter == 'online_paid' ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent?filter=online_paid">Online Paid</a></li>
                <li class="nav-item"><a class="nav-link ${param.filter == 'confirmed' ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent?filter=confirmed">Confirmed</a></li>
                <li class="nav-item"><a class="nav-link ${param.filter == 'completed' ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent?filter=completed">Completed</a></li>
                <li class="nav-item"><a class="nav-link ${param.filter == 'cancelled' ? 'active' : ''}" href="${pageContext.request.contextPath}/admin/rent?filter=cancelled">Cancelled</a></li>
            </ul>

            <div class="card card-modern border-0 p-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light text-uppercase small text-muted">
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Car</th>
                                <th>Dates</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <c:forEach var="b" items="${bookings}">
                                <tr>
                                    <td class="fw-bold text-primary">#RENT-${b.bookingId}</td>
                                    <td>
                                        <div class="fw-semibold">${b.userName}</div>
                                        <small class="text-muted">${b.userEmail}</small>
                                    </td>
                                    <td>
                                        <div class="fw-semibold">${b.carBrand} ${b.carName}</div>
                                        <small class="text-muted">${b.totalDays} day(s)</small>
                                    </td>
                                    <td class="small">
                                        <i class="fas fa-calendar-alt text-primary me-1"></i>${b.startDate}<br>
                                        <i class="fas fa-calendar-check text-success me-1"></i>${b.endDate}
                                    </td>
                                    <td class="fw-bold">Rs. <fmt:formatNumber value="${b.finalPrice}" pattern="#,##0" /></td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${b.paymentStatus == 'Paid'}"><span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Paid</span></c:when>
                                            <c:when test="${b.paymentStatus == 'Refunded'}"><span class="badge bg-info">Refunded</span></c:when>
                                            <c:otherwise><span class="badge bg-warning text-dark">Unpaid</span></c:otherwise>
                                        </c:choose>
                                        <br><small class="text-muted">${empty b.paymentMethod ? 'Cash' : b.paymentMethod}</small>
                                    </td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${b.bookingStatus == 'Pending'}"><span class="badge bg-warning text-dark">Pending</span></c:when>
                                            <c:when test="${b.bookingStatus == 'Confirmed'}"><span class="badge bg-primary">Confirmed</span></c:when>
                                            <c:when test="${b.bookingStatus == 'Completed'}"><span class="badge bg-success">Completed</span></c:when>
                                            <c:when test="${b.bookingStatus == 'Cancelled'}"><span class="badge bg-danger">Cancelled</span></c:when>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <!-- View Details Button -->
                                        <button class="btn btn-sm btn-outline-info mb-1"
                                            data-bs-toggle="modal" data-bs-target="#viewBooking${b.bookingId}"
                                            title="View Details"><i class="fas fa-eye"></i></button>

                                        <!-- Cash Pending: show Confirm -->
                                        <c:if test="${b.bookingStatus == 'Pending'}">
                                            <form action="${pageContext.request.contextPath}/admin/confirm_booking" method="post" style="display:inline;">
                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                <button class="btn btn-sm btn-success mb-1" title="Confirm"><i class="fas fa-check"></i></button>
                                            </form>
                                            <form action="${pageContext.request.contextPath}/admin/cancel_booking" method="post" style="display:inline;" onsubmit="return confirm('Cancel this booking?');">
                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                <button class="btn btn-sm btn-danger mb-1" title="Cancel"><i class="fas fa-times"></i></button>
                                            </form>
                                        </c:if>
                                        <c:if test="${b.bookingStatus == 'Confirmed'}">
                                            <form action="${pageContext.request.contextPath}/admin/complete_booking" method="post" style="display:inline;">
                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                <button class="btn btn-sm btn-outline-success mb-1">Complete</button>
                                            </form>
                                        </c:if>
                                        <c:if test="${b.paymentStatus == 'Unpaid' && (b.bookingStatus == 'Confirmed' || b.bookingStatus == 'Completed')}">
                                            <form action="${pageContext.request.contextPath}/admin/mark_paid" method="post" style="display:inline;">
                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                <button class="btn btn-sm btn-outline-warning mb-1" title="Mark Paid"><i class="fas fa-rupee-sign"></i> Paid</button>
                                            </form>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty bookings}">
                                <tr><td colspan="8" class="text-center text-muted py-5">
                                    <i class="fas fa-clipboard-list fa-3x mb-3 d-block opacity-50"></i>No bookings found
                                </td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
                <c:if test="${totalPages > 1}">
                    <nav class="mt-3"><ul class="pagination justify-content-center">
                        <c:forEach begin="1" end="${totalPages}" var="i">
                            <li class="page-item ${currentPage == i ? 'active' : ''}">
                                <a class="page-link" href="${pageContext.request.contextPath}/admin/rent?page=${i}&filter=${param.filter}">${i}</a>
                            </li>
                        </c:forEach>
                    </ul></nav>
                </c:if>
            </div>
        </main>

        <!-- ===== BOOKING DETAIL MODALS (rendered outside main) ===== -->
        <c:forEach var="b" items="${bookings}">
            <div class="modal fade" id="viewBooking${b.bookingId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title"><i class="fas fa-clipboard-list me-2"></i>Booking #RENT-${b.bookingId} — Full Details</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <!-- Customer Info -->
                                <div class="col-md-6">
                                    <div class="card border h-100 p-3">
                                        <h6 class="fw-bold text-primary mb-3"><i class="fas fa-user me-2"></i>Customer Info</h6>
                                        <table class="table table-sm table-borderless mb-0">
                                            <tr><td class="text-muted fw-bold small">Name</td><td>${b.userName}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Email</td><td>${b.userEmail}</td></tr>
                                        </table>
                                    </div>
                                </div>
                                <!-- Car Info -->
                                <div class="col-md-6">
                                    <div class="card border h-100 p-3">
                                        <h6 class="fw-bold text-primary mb-3"><i class="fas fa-car me-2"></i>Vehicle Info</h6>
                                        <table class="table table-sm table-borderless mb-0">
                                            <tr><td class="text-muted fw-bold small">Car</td><td>${b.carBrand} ${b.carName}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Car ID</td><td>#${b.carId}</td></tr>
                                        </table>
                                    </div>
                                </div>
                                <!-- Booking Dates & Locations -->
                                <div class="col-md-6">
                                    <div class="card border h-100 p-3">
                                        <h6 class="fw-bold text-primary mb-3"><i class="fas fa-map-marker-alt me-2"></i>Booking Details</h6>
                                        <table class="table table-sm table-borderless mb-0">
                                            <tr><td class="text-muted fw-bold small">Pickup Date</td><td>${b.startDate}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Drop Date</td><td>${b.endDate}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Days</td><td>${b.totalDays}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Pickup Location</td><td><span class="text-success">${empty b.pickupLocation ? 'N/A' : b.pickupLocation}</span></td></tr>
                                            <tr><td class="text-muted fw-bold small">Drop Location</td><td><span class="text-danger">${empty b.dropLocation ? 'N/A' : b.dropLocation}</span></td></tr>
                                        </table>
                                    </div>
                                </div>
                                <!-- Payment Info -->
                                <div class="col-md-6">
                                    <div class="card border h-100 p-3">
                                        <h6 class="fw-bold text-primary mb-3"><i class="fas fa-rupee-sign me-2"></i>Payment Details</h6>
                                        <table class="table table-sm table-borderless mb-0">
                                            <tr><td class="text-muted fw-bold small">Total Price</td><td>Rs. <fmt:formatNumber value="${b.totalPrice}" pattern="#,##0"/></td></tr>
                                            <tr><td class="text-muted fw-bold small">Discount</td><td class="text-danger">- Rs. <fmt:formatNumber value="${b.discountAmount}" pattern="#,##0"/></td></tr>
                                            <tr><td class="text-muted fw-bold small">Final Price</td><td class="fw-bold text-success">Rs. <fmt:formatNumber value="${b.finalPrice}" pattern="#,##0"/></td></tr>
                                            <tr><td class="text-muted fw-bold small">Method</td><td>${empty b.paymentMethod ? 'Cash' : b.paymentMethod}</td></tr>
                                            <tr><td class="text-muted fw-bold small">Payment Status</td>
                                                <td>
                                                    <c:choose>
                                                        <c:when test="${b.paymentStatus == 'Paid'}"><span class="badge bg-success">Paid</span></c:when>
                                                        <c:when test="${b.paymentStatus == 'Refunded'}"><span class="badge bg-info">Refunded</span></c:when>
                                                        <c:otherwise><span class="badge bg-warning text-dark">Unpaid</span></c:otherwise>
                                                    </c:choose>
                                                </td>
                                            </tr>
                                            <tr><td class="text-muted fw-bold small">Transaction ID</td><td><code>${empty b.transactionId ? 'N/A' : b.transactionId}</code></td></tr>
                                        </table>
                                    </div>
                                </div>
                                <!-- Booking Status & Actions -->
                                <div class="col-12">
                                    <div class="card border p-3">
                                        <h6 class="fw-bold text-primary mb-3"><i class="fas fa-cog me-2"></i>Booking Status & Actions</h6>
                                        <div class="d-flex align-items-center gap-2 flex-wrap">
                                            <div class="me-3">
                                                Current Status: &nbsp;
                                                <c:choose>
                                                    <c:when test="${b.bookingStatus == 'Pending'}"><span class="badge bg-warning text-dark fs-6">Pending</span></c:when>
                                                    <c:when test="${b.bookingStatus == 'Confirmed'}"><span class="badge bg-primary fs-6">Confirmed</span></c:when>
                                                    <c:when test="${b.bookingStatus == 'Completed'}"><span class="badge bg-success fs-6">Completed</span></c:when>
                                                    <c:when test="${b.bookingStatus == 'Cancelled'}"><span class="badge bg-danger fs-6">Cancelled</span></c:when>
                                                </c:choose>
                                            </div>
                                            <c:if test="${b.bookingStatus == 'Pending'}">
                                                <form action="${pageContext.request.contextPath}/admin/confirm_booking" method="post" style="display:inline;">
                                                    <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                    <button class="btn btn-success"><i class="fas fa-check me-1"></i>Confirm</button>
                                                </form>
                                                <form action="${pageContext.request.contextPath}/admin/cancel_booking" method="post" style="display:inline;" onsubmit="return confirm('Cancel this booking?');">
                                                    <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                    <button class="btn btn-danger"><i class="fas fa-times me-1"></i>Cancel</button>
                                                </form>
                                            </c:if>
                                            <c:if test="${b.bookingStatus == 'Confirmed'}">
                                                <form action="${pageContext.request.contextPath}/admin/complete_booking" method="post" style="display:inline;">
                                                    <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                    <button class="btn btn-outline-success"><i class="fas fa-flag-checkered me-1"></i>Mark Complete</button>
                                                </form>
                                            </c:if>
                                            <c:if test="${b.paymentStatus == 'Unpaid' && b.bookingStatus != 'Cancelled'}">
                                                <form action="${pageContext.request.contextPath}/admin/mark_paid" method="post" style="display:inline;">
                                                    <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                    <button class="btn btn-warning"><i class="fas fa-rupee-sign me-1"></i>Mark Paid</button>
                                                </form>
                                            </c:if>
                                            <small class="text-muted ms-auto">Booked on: ${b.createdAt}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </c:forEach>

        <%@ include file="components/adminFooter.jsp" %>