<!-- ========== ADMIN SIDEBAR ========== -->
<aside class="admin-sidebar" id="adminSidebar">

    <div class="sidebar-brand">
        <i class="fas fa-car-side" style="font-size: 1.6rem; color: var(--sidebar-accent);"></i>
        <div class="brand-text"><span>CARENT</span></div>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-label">Main</div>
        <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/dashboard"><i class="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/vehicles"><i class="fas fa-car"></i><span>Vehicles</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/rent"><i class="fas fa-list-alt"></i><span>Rent Requests</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/customers"><i class="fas fa-users"></i><span>Customers</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/payments"><i class="fas fa-credit-card"></i><span>Payments</span></a></li>
        </ul>

        <div class="nav-label">Analytics &amp; Finance</div>
        <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/analytics"><i class="fas fa-chart-bar"></i><span>Analytics</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/finance"><i class="fas fa-file-invoice-dollar"></i><span>Finance &amp; Tax</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/fleet"><i class="fas fa-tools"></i><span>Fleet Maintenance</span></a></li>
        </ul>

        <div class="nav-label">Management</div>
        <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/coupons"><i class="fas fa-tags"></i><span>Coupons</span></a></li>
            <li class="nav-item">
                <a class="nav-link" href="${pageContext.request.contextPath}/admin/messages" id="messagesNavLink">
                    <i class="fas fa-envelope"></i><span>Messages</span>
                    <span id="msgBadge" class="badge bg-danger ms-auto" style="display:none;font-size:0.65rem;"></span>
                </a>
            </li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/reviews"><i class="fas fa-star"></i><span>Reviews</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/notifications"><i class="fas fa-bell"></i><span>Notifications</span></a></li>
        </ul>

        <div class="nav-label">Account</div>
        <ul class="nav flex-column">
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/profile"><i class="fas fa-user-circle"></i><span>Profile</span></a></li>
            <li class="nav-item"><a class="nav-link" href="${pageContext.request.contextPath}/admin/settings"><i class="fas fa-cog"></i><span>Settings</span></a></li>
        </ul>
    </nav>

    <div class="sidebar-footer d-flex flex-column gap-2">
        <a href="${pageContext.request.contextPath}/home" class="btn-logout" style="background: rgba(255,255,255,0.1); color: inherit;">
            <i class="fas fa-globe"></i><span>Back to Website</span>
        </a>
        <a href="${pageContext.request.contextPath}/logout" class="btn-logout">
            <i class="fas fa-sign-out-alt"></i><span>Logout</span>
        </a>
    </div>

</aside>

<script>
// Fetch unread message count and show badge
fetch('${pageContext.request.contextPath}/admin/api/unread_count')
    .then(r => r.json())
    .then(d => {
        if (d.count > 0) {
            const b = document.getElementById('msgBadge');
            if (b) { b.textContent = d.count; b.style.display = 'inline-block'; }
        }
    }).catch(() => {});
</script>