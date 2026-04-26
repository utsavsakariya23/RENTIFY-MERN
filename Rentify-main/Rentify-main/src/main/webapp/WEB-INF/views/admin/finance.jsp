<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ include file="components/adminHeader.jsp" %>

<style>
.finance-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 2px 12px rgba(0,0,0,0.07); }
.gst-badge { background: linear-gradient(135deg, #198754, #0f5132); color: white; border-radius: 12px; padding: 0.75rem 1.5rem; }
</style>

<main class="container-fluid my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">💰 Finance & Tax Management</h2>
            <p class="text-muted small mb-0">GST-aware income statements and tax summaries</p>
        </div>
        <div class="d-flex gap-2 align-items-center">
            <!-- Year Selector -->
            <form method="get" action="${pageContext.request.contextPath}/admin/finance" class="d-flex gap-2">
                <select name="year" class="form-select" style="width:120px;">
                    <c:forEach begin="2023" end="2027" var="y">
                        <option value="${y}" ${selectedYear == y ? 'selected' : ''}>${y}</option>
                    </c:forEach>
                </select>
                <button type="submit" class="btn btn-primary">View</button>
            </form>
            <button onclick="window.print()" class="btn btn-outline-secondary"><i class="fas fa-print me-1"></i>Print</button>
        </div>
    </div>

    <!-- Current Month Statement -->
    <div class="row g-3 mb-4">
        <div class="col-md-8">
            <div class="finance-card h-100">
                <h5 class="fw-bold mb-3">📅 ${currentMonth} ${currentYear} — Income Statement</h5>
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center">
                            <div class="small text-muted fw-bold">GROSS REVENUE</div>
                            <h4 class="fw-bold text-primary">Rs. <fmt:formatNumber value="${currentMonthStmt.grossRevenue}" pattern="#,##0"/></h4>
                            <small class="text-muted">Total paid bookings</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center" style="border-color: #dc3545 !important;">
                            <div class="small text-muted fw-bold">GST COLLECTED (${gstRate}%)</div>
                            <h4 class="fw-bold text-danger">Rs. <fmt:formatNumber value="${currentMonthStmt.gstCollected}" pattern="#,##0"/></h4>
                            <small class="text-muted">Payable to government</small>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center" style="border-color: #198754 !important;">
                            <div class="small text-muted fw-bold">NET REVENUE</div>
                            <h4 class="fw-bold text-success">Rs. <fmt:formatNumber value="${currentMonthStmt.netRevenue}" pattern="#,##0"/></h4>
                            <small class="text-muted">After GST deduction</small>
                        </div>
                    </div>
                </div>
                <div class="mt-3 p-3 rounded" style="background: #f8f9fa;">
                    <small class="text-muted"><i class="fas fa-info-circle me-1"></i>GST is calculated as inclusive: GST = Revenue × ${gstRate}/(100+${gstRate}). These figures apply to PAID bookings only.</small>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="finance-card h-100">
                <h5 class="fw-bold mb-3">📊 ${selectedYear} Quarterly GST</h5>
                <c:forEach var="q" items="${quarterlyGST}">
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                        <div class="fw-bold small">${q.key}</div>
                        <div class="text-danger fw-bold">Rs. <fmt:formatNumber value="${q.value}" pattern="#,##0"/></div>
                    </div>
                </c:forEach>
                <div class="mt-3 p-2 rounded text-center gst-badge">
                    <small class="fw-bold">GST RATE: ${gstRate}%</small><br>
                    <small>Standard Car Rental GST (India)</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Yearly Summary Table -->
    <div class="finance-card">
        <h5 class="fw-bold mb-3">📅 ${selectedYear} Monthly Breakdown</h5>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead class="table-light text-uppercase small">
                    <tr>
                        <th>Month</th>
                        <th>Total Bookings</th>
                        <th>Paid Bookings</th>
                        <th>Gross Revenue</th>
                        <th>GST (${gstRate}%)</th>
                        <th>Net Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    <c:set var="totalGross" value="0"/>
                    <c:set var="totalGST" value="0"/>
                    <c:set var="totalNet" value="0"/>
                    <c:forEach var="row" items="${yearlySummary}">
                        <tr>
                            <td class="fw-bold">${row.monthName}</td>
                            <td>${row.bookingCount}</td>
                            <td><span class="badge bg-success">${row.bookingCount}</span></td>
                            <td>Rs. <fmt:formatNumber value="${row.revenue}" pattern="#,##0"/></td>
                            <td class="text-danger">Rs. <fmt:formatNumber value="${row.gst}" pattern="#,##0"/></td>
                            <td class="text-success fw-bold">Rs. <fmt:formatNumber value="${row.netRevenue}" pattern="#,##0"/></td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty yearlySummary}">
                        <tr><td colspan="6" class="text-center text-muted py-4">No data for ${selectedYear}</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</main>

<%@ include file="components/adminFooter.jsp" %>
