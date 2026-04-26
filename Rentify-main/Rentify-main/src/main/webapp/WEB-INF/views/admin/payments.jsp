<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container-fluid my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">💳 Payments Management</h2>
            <p class="text-muted small mb-0">Monitor and manage all payment transactions</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#exportModal">
                <i class="fas fa-file-csv me-2"></i>Export CSV
            </button>
            <a href="${pageContext.request.contextPath}/admin/analytics" class="btn btn-outline-primary">
                <i class="fas fa-chart-bar me-1"></i>Analytics
            </a>
        </div>
    </div>

    <!-- Professional Export Modal -->
    <div class="modal fade" id="exportModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"><h5 class="modal-title"><i class="fas fa-download me-2"></i>Export Payments CSV</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                <form action="${pageContext.request.contextPath}/admin/export_payments_csv" method="post">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Quick Select</label>
                            <div class="d-flex gap-2 flex-wrap">
                                <button type="submit" name="preset" value="this_month" class="btn btn-sm btn-outline-primary">This Month</button>
                                <button type="submit" name="preset" value="last_month" class="btn btn-sm btn-outline-secondary">Last Month</button>
                                <button type="submit" name="preset" value="last_3_months" class="btn btn-sm btn-outline-secondary">Last 3 Months</button>
                                <button type="submit" name="preset" value="this_year" class="btn btn-sm btn-outline-secondary">This Year</button>
                            </div>
                        </div>
                        <hr>
                        <div class="row g-2 mb-3">
                            <div class="col"><label class="form-label fw-bold">Start Date</label><input type="date" name="startDate" class="form-control"></div>
                            <div class="col"><label class="form-label fw-bold">End Date</label><input type="date" name="endDate" class="form-control"></div>
                        </div>
                        <div class="row g-2">
                            <div class="col">
                                <label class="form-label fw-bold">Payment Status</label>
                                <select name="payStatus" class="form-select">
                                    <option value="">All</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Refunded">Refunded</option>
                                </select>
                            </div>
                            <div class="col">
                                <label class="form-label fw-bold">Payment Method</label>
                                <select name="payMethod" class="form-select">
                                    <option value="">All</option><option value="Cash">Cash</option><option value="Online">Online</option><option value="Razorpay">Razorpay</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-success"><i class="fas fa-download me-1"></i>Export Now</button>
                    </div>
                </form>
            </div>
        </div>
    </div>


    <!-- KPI Cards -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card border-0 p-3 h-100" style="background: linear-gradient(135deg,#0d6efd,#0a58ca); color:white;">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="small opacity-75 text-uppercase fw-bold">Total Revenue</div>
                        <h3 class="fw-bold mb-0">Rs. <fmt:formatNumber value="${totalRevenue}" pattern="#,##0"/></h3>
                    </div>
                    <i class="fas fa-coins fa-2x opacity-50"></i>
                </div>
                <div class="mt-2 small opacity-75">From paid bookings only</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="small text-muted text-uppercase fw-bold">Paid Transactions</div>
                        <h3 class="fw-bold mb-0 text-success">${paidCount}</h3>
                    </div>
                    <i class="fas fa-check-circle fa-2x text-success opacity-50"></i>
                </div>
                <div class="mt-2 small text-muted">Completed payments</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="small text-muted text-uppercase fw-bold">Unpaid</div>
                        <h3 class="fw-bold mb-0 text-warning">${unpaidCount}</h3>
                    </div>
                    <i class="fas fa-clock fa-2x text-warning opacity-50"></i>
                </div>
                <div class="mt-2 small text-muted">Awaiting payment</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 p-3 h-100 bg-white">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <div class="small text-muted text-uppercase fw-bold">Online Payments</div>
                        <h3 class="fw-bold mb-0 text-info">${onlineCount}</h3>
                    </div>
                    <i class="fas fa-credit-card fa-2x text-info opacity-50"></i>
                </div>
                <div class="mt-2 small text-muted">Razorpay transactions</div>
            </div>
        </div>
    </div>

    <!-- Filter Bar -->
    <div class="card border-0 p-3 mb-3">
        <form method="get" action="${pageContext.request.contextPath}/admin/payments" class="row g-2 align-items-end">
            <div class="col-md-3">
                <label class="form-label small fw-bold text-muted">PAYMENT STATUS</label>
                <select name="payStatus" class="form-select">
                    <option value="" ${empty param.payStatus ? 'selected' : ''}>All Statuses</option>
                    <option value="Paid" ${param.payStatus == 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Unpaid" ${param.payStatus == 'Unpaid' ? 'selected' : ''}>Unpaid</option>
                    <option value="Refunded" ${param.payStatus == 'Refunded' ? 'selected' : ''}>Refunded</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label small fw-bold text-muted">PAYMENT METHOD</label>
                <select name="payMethod" class="form-select">
                    <option value="" ${empty param.payMethod ? 'selected' : ''}>All Methods</option>
                    <option value="Online" ${param.payMethod == 'Online' ? 'selected' : ''}>Online (Razorpay)</option>
                    <option value="Cash" ${param.payMethod == 'Cash' ? 'selected' : ''}>Cash</option>
                </select>
            </div>
            <div class="col-md-2">
                <button type="submit" class="btn btn-primary w-100"><i class="fas fa-filter me-1"></i>Filter</button>
            </div>
            <div class="col-md-2">
                <a href="${pageContext.request.contextPath}/admin/payments" class="btn btn-outline-secondary w-100">Reset</a>
            </div>
        </form>
    </div>

    <div class="card card-modern border-0 p-4 shadow-sm">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-uppercase small text-muted">
                    <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Car</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Transaction ID</th>
                        <th>Payment</th>
                        <th>Booking</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="p" items="${payments}">
                        <tr>
                            <td class="fw-bold text-primary">#RENT-${p.bookingId}</td>
                            <td>
                                <div class="fw-semibold">${p.userName}</div>
                                <small class="text-muted">${p.userEmail}</small>
                            </td>
                            <td class="small">${p.carBrand} ${p.carName}</td>
                            <td class="fw-bold">Rs. <fmt:formatNumber value="${p.finalPrice}" pattern="#,##0" /></td>
                            <td>
                                <c:choose>
                                    <c:when test="${p.paymentMethod == 'Online'}">
                                        <span class="badge bg-info text-dark"><i class="fas fa-credit-card me-1"></i>Razorpay</span>
                                    </c:when>
                                    <c:otherwise>
                                        <span class="badge bg-secondary"><i class="fas fa-money-bill-wave me-1"></i>Cash</span>
                                    </c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${not empty p.transactionId}">
                                        <code class="text-muted small" id="txn_${p.bookingId}">${p.transactionId}</code>
                                        <button class="btn btn-link btn-sm p-0 ms-1" title="Copy"
                                            onclick="navigator.clipboard.writeText('${p.transactionId}').then(()=>this.innerHTML='<i class=\'fas fa-check text-success\'></i>').catch(()=>{})">
                                            <i class="fas fa-copy text-muted"></i>
                                        </button>
                                    </c:when>
                                    <c:otherwise><span class="text-muted fst-italic small">N/A</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${p.paymentStatus == 'Paid'}"><span class="badge bg-success rounded-pill px-3 py-2"><i class="fas fa-check-circle me-1"></i>Paid</span></c:when>
                                    <c:when test="${p.paymentStatus == 'Refunded'}"><span class="badge bg-danger rounded-pill px-3 py-2"><i class="fas fa-undo me-1"></i>Refunded</span></c:when>
                                    <c:otherwise><span class="badge bg-warning text-dark rounded-pill px-3 py-2"><i class="fas fa-clock me-1"></i>Unpaid</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${p.bookingStatus == 'Pending'}"><span class="text-warning fw-bold small"><i class="fas fa-hourglass-half me-1"></i>Pending</span></c:when>
                                    <c:when test="${p.bookingStatus == 'Confirmed'}"><span class="text-primary fw-bold small"><i class="fas fa-thumbs-up me-1"></i>Confirmed</span></c:when>
                                    <c:when test="${p.bookingStatus == 'Completed'}"><span class="text-success fw-bold small"><i class="fas fa-flag-checkered me-1"></i>Completed</span></c:when>
                                    <c:when test="${p.bookingStatus == 'Cancelled'}"><span class="text-danger fw-bold small"><i class="fas fa-ban me-1"></i>Cancelled</span></c:when>
                                    <c:otherwise><span class="text-secondary fw-bold small">${p.bookingStatus}</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td class="small text-muted">
                                <fmt:formatDate value="${p.createdAt}" pattern="dd MMM yyyy" />
                            </td>
                            <td>
                                <c:if test="${p.paymentStatus == 'Unpaid' && p.bookingStatus != 'Cancelled'}">
                                    <form action="${pageContext.request.contextPath}/admin/mark_paid" method="post" class="d-inline" onsubmit="return confirm('Mark as paid?');">
                                        <input type="hidden" name="bookingId" value="${p.bookingId}">
                                        <input type="hidden" name="redirect" value="payments">
                                        <button class="btn btn-sm btn-outline-success fw-bold"><i class="fas fa-check-double me-1"></i>Mark Paid</button>
                                    </form>
                                </c:if>
                                <c:if test="${p.paymentStatus == 'Paid'}">
                                    <form action="${pageContext.request.contextPath}/admin/refund_payment" method="post" class="d-inline" onsubmit="return confirm('Issue refund for this booking?');">
                                        <input type="hidden" name="bookingId" value="${p.bookingId}">
                                        <button class="btn btn-sm btn-outline-danger"><i class="fas fa-undo me-1"></i>Refund</button>
                                    </form>
                                </c:if>
                                <c:if test="${p.paymentStatus == 'Refunded'}">
                                    <button class="btn btn-sm btn-light text-danger border" disabled><i class="fas fa-undo me-1"></i>Refunded</button>
                                </c:if>
                            </td>
                        </tr>
                    </c:forEach>

                    <c:if test="${empty payments}">
                        <tr><td colspan="10" class="text-center text-muted py-5">
                            <i class="fas fa-wallet fa-3x text-light mb-3 d-block"></i>
                            <h5>No Payments Found</h5>
                            <p>No payment records match the current filter.</p>
                        </td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>

        <c:if test="${totalPages > 1}">
            <nav class="mt-4">
                <ul class="pagination justify-content-center">
                    <c:forEach begin="1" end="${totalPages}" var="i">
                        <li class="page-item ${currentPage == i ? 'active' : ''}">
                            <a class="page-link shadow-none" href="${pageContext.request.contextPath}/admin/payments?page=${i}&payStatus=${param.payStatus}&payMethod=${param.payMethod}">${i}</a>
                        </li>
                    </c:forEach>
                </ul>
            </nav>
        </c:if>
    </div>
</main>

<%@ include file="components/adminFooter.jsp" %>
