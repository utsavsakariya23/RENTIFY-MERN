<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <h2 class="fw-bold mb-4">Manage Customers</h2>
            <div class="card card-modern border-0 p-4">
                <!-- AJAX Search -->
                <div class="mb-3 d-flex gap-2 align-items-center">
                    <div class="input-group" style="max-width: 420px;">
                        <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                        <input type="text" id="customerSearch" class="form-control" placeholder="Search name, email, username, phone..." autocomplete="off">
                        <button class="btn btn-outline-secondary" onclick="document.getElementById('customerSearch').value=''; location.reload();" title="Clear"><i class="fas fa-times"></i></button>
                    </div>
                    <span id="custSearchCount" class="text-muted small"></span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Username</th><th>License</th><th>Role</th><th>Verified</th><th>Joined</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            <c:forEach var="u" items="${users}">
                                <tr>
                                    <td>${u.userId}</td>
                                    <td class="fw-bold">${u.fullName}</td>
                                    <td>${u.email}</td>
                                    <td>${u.phone}</td>
                                    <td>${u.username}</td>
                                    <td>${u.licenseNo}</td>
                                    <td><span class="badge ${u.role == 'Admin' ? 'bg-danger' : 'bg-primary'}">${u.role}</span></td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${u.verified}"><span class="badge bg-success">Verified</span></c:when>
                                            <c:otherwise><span class="badge bg-secondary">Unverified</span></c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td><fmt:formatDate value="${u.createdAt}" pattern="dd MMM yyyy" /></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-info" data-bs-toggle="modal" data-bs-target="#viewCustomerModal${u.userId}" title="View Details"><i class="fas fa-eye"></i></button>
                                        <c:if test="${u.role != 'Admin'}">
                                            <c:choose>
                                                <c:when test="${!u.verified}">
                                                    <form action="${pageContext.request.contextPath}/admin/verify_user" method="post" style="display:inline;">
                                                        <input type="hidden" name="userId" value="${u.userId}"><input type="hidden" name="action" value="verify">
                                                        <button class="btn btn-sm btn-success" title="Verify"><i class="fas fa-check"></i></button>
                                                    </form>
                                                </c:when>
                                                <c:otherwise>
                                                    <form action="${pageContext.request.contextPath}/admin/verify_user" method="post" style="display:inline;">
                                                        <input type="hidden" name="userId" value="${u.userId}"><input type="hidden" name="action" value="unverify">
                                                        <button class="btn btn-sm btn-warning" title="Unverify"><i class="fas fa-ban"></i></button>
                                                    </form>
                                                </c:otherwise>
                                            </c:choose>
                                            <form action="${pageContext.request.contextPath}/admin/delete_user" method="post" style="display:inline;" onsubmit="return confirm('Delete this user?');">
                                                <input type="hidden" name="userId" value="${u.userId}">
                                                <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                            </form>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty users}"><tr><td colspan="10" class="text-center text-muted py-4">No customers found</td></tr></c:if>
                        </tbody>
                    </table>
                </div>

                <c:if test="${totalPages > 1}">
                    <nav class="mt-3"><ul class="pagination justify-content-center">
                        <c:forEach begin="1" end="${totalPages}" var="i">
                            <li class="page-item ${currentPage == i ? 'active' : ''}"><a class="page-link" href="${pageContext.request.contextPath}/admin/customers?page=${i}">${i}</a></li>
                        </c:forEach>
                    </ul></nav>
                </c:if>
            </div>
        </main>

        <!-- View Customer Modals (placed outside main layout to ensure stability) -->
        <c:forEach var="u" items="${users}">
            <div class="modal fade" id="viewCustomerModal${u.userId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-address-card text-info me-2"></i>Customer Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <div class="display-4 text-secondary mb-2"><i class="fas fa-user-circle"></i></div>
                                <h4 class="fw-bold mb-0">${u.fullName}</h4>
                                <span class="badge ${u.role == 'Admin' ? 'bg-danger' : 'bg-primary'} mt-1">${u.role}</span>
                            </div>
                            <table class="table table-sm table-borderless">
                                <tbody>
                                    <tr><th class="text-muted" style="width: 40%;">User ID</th><td class="fw-bold">#${u.userId}</td></tr>
                                    <tr><th class="text-muted">Username</th><td>${u.username}</td></tr>
                                    <tr><th class="text-muted">Email</th><td>${u.email}</td></tr>
                                    <tr><th class="text-muted">Phone</th><td>${u.phone}</td></tr>
                                    <tr><th class="text-muted">License No</th><td><code class="text-dark bg-light px-2 py-1 rounded">${u.licenseNo}</code></td></tr>
                                    <tr><th class="text-muted">Verification</th>
                                        <td>
                                            <c:choose>
                                                <c:when test="${u.verified}"><span class="badge bg-success"><i class="fas fa-check-circle me-1"></i>Verified</span></c:when>
                                                <c:otherwise><span class="badge bg-secondary"><i class="fas fa-times-circle me-1"></i>Unverified</span></c:otherwise>
                                            </c:choose>
                                        </td>
                                    </tr>
                                    <tr><th class="text-muted">Joined On</th><td><fmt:formatDate value="${u.createdAt}" pattern="dd MMM yyyy, HH:mm" /></td></tr>
                                    
                                    <tr><th class="text-muted mt-3 pt-3 border-top" colspan="2"><i class="fas fa-folder-open me-2"></i>Uploaded Documents</th></tr>
                                    <tr>
                                        <th class="text-muted align-middle">ID Document</th>
                                        <td>
                                            <c:choose>
                                                <c:when test="${not empty u.idUrl}">
                                                    <a href="${u.idUrl}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-external-link-alt me-1"></i>View ID</a>
                                                </c:when>
                                                <c:otherwise>
                                                    <span class="text-danger small"><i class="fas fa-times me-1"></i>Not Uploaded</span>
                                                </c:otherwise>
                                            </c:choose>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="text-muted align-middle">License</th>
                                        <td>
                                            <c:choose>
                                                <c:when test="${not empty u.licenseUrl}">
                                                    <a href="${u.licenseUrl}" target="_blank" class="btn btn-sm btn-outline-info"><i class="fas fa-external-link-alt me-1"></i>View License</a>
                                                </c:when>
                                                <c:otherwise>
                                                    <span class="text-danger small"><i class="fas fa-times me-1"></i>Not Uploaded</span>
                                                </c:otherwise>
                                            </c:choose>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </c:forEach>

        <script>
        (function() {
            var CUST_CTX = '${pageContext.request.contextPath}';
            var custTimer;
            var searchInput = document.getElementById('customerSearch');
            if (!searchInput) return;
            searchInput.addEventListener('input', function() {
                clearTimeout(custTimer);
                var q = this.value.trim();
                custTimer = setTimeout(function() {
                    if (!q) { location.reload(); return; }
                    fetch(CUST_CTX + '/admin/api/search_customers?q=' + encodeURIComponent(q))
                      .then(function(r) { return r.json(); })
                      .then(function(data) {
                        document.getElementById('custSearchCount').textContent = data.length + ' result(s)';
                        var tbody = document.getElementById('customerTbody');
                        if (!tbody) return;
                        if (!data.length) {
                            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">No customers match</td></tr>';
                            return;
                        }
                        var html = '';
                        for (var i = 0; i < data.length; i++) {
                            var u = data[i];
                            var roleBadge = (u.role === 'Admin') ? 'bg-danger' : 'bg-primary';
                            var verBadge  = u.verified ? 'bg-success' : 'bg-secondary';
                            var verText   = u.verified ? 'Verified' : 'Unverified';
                            html += '<tr>'
                                + '<td>' + u.userId + '</td>'
                                + '<td class="fw-bold">' + (u.fullName || '') + '</td>'
                                + '<td>' + (u.email || '') + '</td>'
                                + '<td>' + (u.phone || '&mdash;') + '</td>'
                                + '<td>' + (u.username || '') + '</td>'
                                + '<td><code>' + (u.licenseNo || '&mdash;') + '</code></td>'
                                + '<td><span class="badge ' + roleBadge + '">' + u.role + '</span></td>'
                                + '<td><span class="badge ' + verBadge + '">' + verText + '</span></td>'
                                + '<td>&mdash;</td>'
                                + '<td><a href="' + CUST_CTX + '/admin/customers" class="btn btn-sm btn-outline-secondary">View</a></td>'
                                + '</tr>';
                        }
                        tbody.innerHTML = html;
                      }).catch(function() {});
                }, 300);
            });
        })();
        </script>

        <%@ include file="components/adminFooter.jsp" %>