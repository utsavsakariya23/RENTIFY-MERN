<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <div class="row">
                <div class="col-12">
                    <h2 class="fw-bold mb-4">Dashboard Overview</h2>

                    <!-- KPI Cards -->
                    <div class="row g-4 mb-5">
                        <div class="col-md-3">
                            <div class="card card-modern border-0 p-3 h-100 bg-primary text-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-white-50 text-uppercase fw-bold">Total Bookings</h6>
                                        <h2 class="fw-bold mb-0">${totalBookings}</h2>
                                    </div>
                                    <i class="fas fa-chart-line fa-3x opacity-50"></i>
                                </div>
                                <small class="text-white-50 mt-3 d-block"><i class="fas fa-clock me-1"></i>${pendingBookings} pending</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-modern border-0 p-3 h-100 bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted text-uppercase fw-bold">Total Customers</h6>
                                        <h2 class="fw-bold mb-0 text-dark">${totalUsers}</h2>
                                    </div>
                                    <i class="fas fa-users fa-3x text-success opacity-50"></i>
                                </div>
                                <small class="text-success mt-3 d-block">Registered customers</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-modern border-0 p-3 h-100 bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted text-uppercase fw-bold">Total Revenue</h6>
                                        <h2 class="fw-bold mb-0 text-dark">Rs. <fmt:formatNumber value="${totalRevenue}" pattern="#,##0" /></h2>
                                    </div>
                                    <i class="fas fa-coins fa-3x text-warning opacity-50"></i>
                                </div>
                                <small class="text-muted mt-3 d-block">From paid bookings</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-modern border-0 p-3 h-100 bg-white">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="text-muted text-uppercase fw-bold">Fleet Status</h6>
                                        <h2 class="fw-bold mb-0 text-dark">${activeCars}/${totalCars}</h2>
                                    </div>
                                    <i class="fas fa-car fa-3x text-info opacity-50"></i>
                                </div>
                                <small class="text-muted mt-3 d-block">${activeCars} available</small>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4 mb-4">
                        <!-- Recent Bookings Table -->
                        <div class="col-lg-12">
                            <div class="card card-modern border-0 p-4 h-100">
                                <h5 class="fw-bold mb-4">Recent Bookings</h5>
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle">
                                        <thead class="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Customer</th>
                                                <th>Car</th>
                                                <th>Dates</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <c:forEach var="b" items="${recentBookings}">
                                                <tr>
                                                    <td>#${b.bookingId}</td>
                                                    <td>${b.userName}</td>
                                                    <td>${b.carName}</td>
                                                    <td>${b.startDate} - ${b.endDate}</td>
                                                    <td>Rs. <fmt:formatNumber value="${b.finalPrice}" pattern="#,##0" /></td>
                                                    <td>
                                                        <c:choose>
                                                            <c:when test="${b.bookingStatus == 'Pending'}"><span class="badge bg-warning text-dark">Pending</span></c:when>
                                                            <c:when test="${b.bookingStatus == 'Confirmed'}"><span class="badge bg-primary">Confirmed</span></c:when>
                                                            <c:when test="${b.bookingStatus == 'Completed'}"><span class="badge bg-success">Completed</span></c:when>
                                                            <c:when test="${b.bookingStatus == 'Cancelled'}"><span class="badge bg-danger">Cancelled</span></c:when>
                                                        </c:choose>
                                                    </td>
                                                    <td>
                                                        <c:if test="${b.bookingStatus == 'Pending'}">
                                                            <form action="${pageContext.request.contextPath}/admin/confirm_booking" method="post" style="display:inline;">
                                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                                <button class="btn btn-sm btn-success"><i class="fas fa-check"></i></button>
                                                            </form>
                                                            <form action="${pageContext.request.contextPath}/admin/cancel_booking" method="post" style="display:inline;">
                                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                                <button class="btn btn-sm btn-danger"><i class="fas fa-times"></i></button>
                                                            </form>
                                                        </c:if>
                                                        <c:if test="${b.bookingStatus == 'Confirmed'}">
                                                            <form action="${pageContext.request.contextPath}/admin/complete_booking" method="post" style="display:inline;">
                                                                <input type="hidden" name="bookingId" value="${b.bookingId}">
                                                                <button class="btn btn-sm btn-outline-success">Complete</button>
                                                            </form>
                                                        </c:if>
                                                    </td>
                                                </tr>
                                            </c:forEach>
                                            <c:if test="${empty recentBookings}">
                                                <tr><td colspan="7" class="text-center text-muted py-4">No bookings yet</td></tr>
                                            </c:if>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <%@ include file="components/adminFooter.jsp" %>