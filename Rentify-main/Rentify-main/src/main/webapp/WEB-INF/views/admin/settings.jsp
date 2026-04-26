<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container-fluid my-5">
    <h2 class="fw-bold mb-4">⚙️ Settings</h2>

    <div class="row g-4">
        <div class="col-md-6">
            <div class="card border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3"><i class="fas fa-building me-2 text-primary"></i>Business Information</h5>
                <form>
                    <div class="mb-3"><label class="form-label">Business Name</label><input type="text" class="form-control" value="Carent Car Rentals" placeholder="Business name"></div>
                    <div class="mb-3"><label class="form-label">GST Number</label><input type="text" class="form-control" placeholder="e.g. 24XXXXX0001Z1"></div>
                    <div class="mb-3"><label class="form-label">Address</label><textarea class="form-control" rows="2" placeholder="Business address"></textarea></div>
                    <div class="mb-3"><label class="form-label">Support Email</label><input type="email" class="form-control" placeholder="support@carent.in"></div>
                    <div class="mb-3"><label class="form-label">Support Phone</label><input type="text" class="form-control" placeholder="+91 98765 43210"></div>
                    <div class="alert alert-info small"><i class="fas fa-info-circle me-1"></i>Settings persistence is coming soon. These will appear on invoices.</div>
                </form>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3"><i class="fas fa-cog me-2 text-success"></i>System Settings</h5>
                <div class="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
                    <div><div class="fw-bold">GST Rate</div><div class="small text-muted">Applied to all invoices</div></div>
                    <span class="badge bg-success fs-6">18%</span>
                </div>
                <div class="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
                    <div><div class="fw-bold">Auto-Confirm Online Payments</div><div class="small text-muted">Bookings paid online auto confirm</div></div>
                    <span class="badge bg-success">Enabled</span>
                </div>
                <div class="mb-3 d-flex justify-content-between align-items-center border-bottom pb-3">
                    <div><div class="fw-bold">Cash Payment Approval</div><div class="small text-muted">Admin manually approves cash bookings</div></div>
                    <span class="badge bg-warning text-dark">Manual</span>
                </div>
                <div class="mb-3 d-flex justify-content-between align-items-center">
                    <div><div class="fw-bold">Email Notifications</div><div class="small text-muted">Send booking confirmations by email</div></div>
                    <span class="badge bg-success">Enabled</span>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card border-0 shadow-sm p-4">
                <h5 class="fw-bold mb-3"><i class="fas fa-link me-2 text-warning"></i>Quick Links</h5>
                <div class="row g-2">
                    <div class="col-md-3"><a href="${pageContext.request.contextPath}/admin/analytics" class="btn btn-outline-primary w-100"><i class="fas fa-chart-bar me-1"></i>Analytics</a></div>
                    <div class="col-md-3"><a href="${pageContext.request.contextPath}/admin/finance" class="btn btn-outline-success w-100"><i class="fas fa-rupee-sign me-1"></i>Finance & Tax</a></div>
                    <div class="col-md-3"><a href="${pageContext.request.contextPath}/admin/fleet" class="btn btn-outline-warning w-100"><i class="fas fa-tools me-1"></i>Fleet</a></div>
                    <div class="col-md-3"><a href="${pageContext.request.contextPath}/admin/payments" class="btn btn-outline-info w-100"><i class="fas fa-credit-card me-1"></i>Payments</a></div>
                </div>
            </div>
        </div>
    </div>
</main>

<%@ include file="components/adminFooter.jsp" %>
