<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ include file="components/adminHeader.jsp" %>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<style>
.analytics-kpi { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
.chart-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.07); height: 340px; }
</style>

<main class="container-fluid my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">📊 Business Analytics</h2>
            <p class="text-muted small mb-0">Real-time insights into your car rental business</p>
        </div>
        <span class="badge bg-primary p-2 fs-6">Live Data</span>
    </div>

    <!-- KPI Row -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="analytics-kpi text-center" style="border-left: 4px solid #0d6efd;">
                <div class="text-muted small fw-bold">TOTAL REVENUE</div>
                <h3 class="fw-bold text-primary">Rs. <fmt:formatNumber value="${totalRevenue}" pattern="#,##0"/></h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-kpi text-center" style="border-left: 4px solid #198754;">
                <div class="text-muted small fw-bold">TOTAL BOOKINGS</div>
                <h3 class="fw-bold text-success">${totalBookings}</h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-kpi text-center" style="border-left: 4px solid #fd7e14;">
                <div class="text-muted small fw-bold">AVG BOOKING VALUE</div>
                <h3 class="fw-bold text-warning">
                    Rs. <fmt:formatNumber value="${totalBookings > 0 ? totalRevenue / totalBookings : 0}" pattern="#,##0"/>
                </h3>
            </div>
        </div>
        <div class="col-md-3">
            <div class="analytics-kpi text-center" style="border-left: 4px solid #dc3545;">
                <div class="text-muted small fw-bold">PENDING APPROVALS</div>
                <h3 class="fw-bold text-danger">${bookingStatusCounts['Pending'] != null ? bookingStatusCounts['Pending'] : 0}</h3>
            </div>
        </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="row g-3 mb-3">
        <!-- Monthly Revenue Bar Chart -->
        <div class="col-lg-8">
            <div class="chart-card">
                <h6 class="fw-bold text-muted mb-3">📈 Monthly Revenue (Last 12 Months)</h6>
                <canvas id="revenueChart"></canvas>
            </div>
        </div>
        <!-- Booking Status Pie -->
        <div class="col-lg-4">
            <div class="chart-card">
                <h6 class="fw-bold text-muted mb-3">🔴 Booking Status Breakdown</h6>
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="row g-3 mb-3">
        <!-- Payment Method Donut -->
        <div class="col-lg-4">
            <div class="chart-card">
                <h6 class="fw-bold text-muted mb-3">💳 Payment Method Split</h6>
                <canvas id="paymentChart"></canvas>
            </div>
        </div>
        <!-- Top Cars Horizontal Bar -->
        <div class="col-lg-8">
            <div class="chart-card">
                <h6 class="fw-bold text-muted mb-3">🚗 Top 5 Most Rented Cars</h6>
                <canvas id="topCarsChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Top Customers Table -->
    <div class="row g-3">
        <div class="col-12">
            <div class="card border-0 shadow-sm p-4">
                <h6 class="fw-bold text-muted mb-3">🏆 Top 5 Customers by Spend</h6>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light text-uppercase small">
                            <tr><th>#</th><th>Name</th><th>Email</th><th>Bookings</th><th>Total Spend</th><th>Avg Spend</th></tr>
                        </thead>
                        <tbody>
                            <c:set var="rank" value="1"/>
                            <c:forEach var="cust" items="${topCustomers}">
                                <tr>
                                    <td>
                                        <c:choose>
                                            <c:when test="${rank == 1}">🥇</c:when>
                                            <c:when test="${rank == 2}">🥈</c:when>
                                            <c:when test="${rank == 3}">🥉</c:when>
                                            <c:otherwise>#${rank}</c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td class="fw-bold">${cust.fullName}</td>
                                    <td class="text-muted">${cust.email}</td>
                                    <td><span class="badge bg-primary">${cust.bookingCount}</span></td>
                                    <td class="fw-bold text-success">Rs. <fmt:formatNumber value="${cust.totalSpend}" pattern="#,##0"/></td>
                                    <td class="text-muted">Rs. <fmt:formatNumber value="${cust.bookingCount > 0 ? cust.totalSpend / cust.bookingCount : 0}" pattern="#,##0"/></td>
                                </tr>
                                <c:set var="rank" value="${rank + 1}"/>
                            </c:forEach>
                            <c:if test="${empty topCustomers}">
                                <tr><td colspan="6" class="text-center text-muted py-4">No data yet</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</main>

<script>
// ===== Build data from server-side =====
// Monthly Revenue
const revLabels = [];
const revData = [];
<c:forEach var="m" items="${monthlyRevenue}">
    revLabels.push('${m.label}');
    revData.push(${m.revenue});
</c:forEach>

// Booking Status
const statusLabels = [];
const statusData = [];
const statusColors = {'Pending':'#ffc107','Confirmed':'#0d6efd','Completed':'#198754','Cancelled':'#dc3545'};
const statusBg = [];
<c:forEach var="entry" items="${bookingStatusCounts}">
    statusLabels.push('${entry.key}');
    statusData.push(${entry.value});
    statusBg.push(statusColors['${entry.key}'] || '#6c757d');
</c:forEach>

// Payment Method
const payLabels = [];
const payData = [];
<c:forEach var="entry" items="${paymentMethodSplit}">
    payLabels.push('${entry.key}');
    payData.push(${entry.value});
</c:forEach>

// Top Cars
const carLabels = [];
const carData = [];
<c:forEach var="car" items="${topRentedCars}">
    carLabels.push('${car.brand} ${car.name}');
    carData.push(${car.totalBookings});
</c:forEach>

// ===== Chart.js Rendering =====
// Revenue Bar Chart
new Chart(document.getElementById('revenueChart'), {
    type: 'bar',
    data: { labels: revLabels, datasets: [{ label: 'Revenue (Rs.)', data: revData, backgroundColor: 'rgba(13,110,253,0.8)', borderRadius: 8 }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => 'Rs.' + v.toLocaleString() } } } }
});

// Status Pie Chart
new Chart(document.getElementById('statusChart'), {
    type: 'pie',
    data: { labels: statusLabels, datasets: [{ data: statusData, backgroundColor: statusBg }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
});

// Payment Method Donut
new Chart(document.getElementById('paymentChart'), {
    type: 'doughnut',
    data: { labels: payLabels, datasets: [{ data: payData, backgroundColor: ['#0dcaf0','#6c757d','#198754'] }] },
    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
});

// Top Cars Horizontal Bar
new Chart(document.getElementById('topCarsChart'), {
    type: 'bar',
    data: { labels: carLabels, datasets: [{ label: 'Bookings', data: carData, backgroundColor: 'rgba(25,135,84,0.8)', borderRadius: 8 }] },
    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
});
</script>

<%@ include file="components/adminFooter.jsp" %>
