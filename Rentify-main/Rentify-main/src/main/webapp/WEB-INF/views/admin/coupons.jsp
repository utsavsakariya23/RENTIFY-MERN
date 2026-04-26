<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">Manage Coupons</h2>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCouponModal"><i class="fas fa-plus me-2"></i>Add Coupon</button>
            </div>

            <c:if test="${not empty param.success}">
                <div class="alert alert-success alert-dismissible fade show">${param.success}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
            </c:if>

            <div class="card card-modern border-0 p-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>ID</th><th>Code</th><th>Discount %</th><th>Expiry Date</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            <c:forEach var="c" items="${coupons}">
                                <tr>
                                    <td>${c.couponId}</td>
                                    <td><code class="fw-bold">${c.code}</code></td>
                                    <td>${c.discountPercentage}%</td>
                                    <td>${c.expiryDate}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${c.active}"><span class="badge bg-success">Active</span></c:when>
                                            <c:otherwise><span class="badge bg-secondary">Inactive</span></c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editCouponModal${c.couponId}"><i class="fas fa-edit"></i></button>
                                        <form action="${pageContext.request.contextPath}/admin/delete_coupon" method="post" style="display:inline;" onsubmit="return confirm('Delete this coupon?');">
                                            <input type="hidden" name="couponId" value="${c.couponId}">
                                            <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>

                            </c:forEach>
                            <c:if test="${empty coupons}"><tr><td colspan="6" class="text-center text-muted py-4">No coupons found</td></tr></c:if>
                        </tbody>
                    </table>
                </div>

            </div>

        </main>

        <!-- Edit Modals (outside main container to prevent z-index issues) -->
        <c:forEach var="c" items="${coupons}">
            <div class="modal fade" id="editCouponModal${c.couponId}" tabindex="-1">
                <div class="modal-dialog"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Edit Coupon</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <form action="${pageContext.request.contextPath}/admin/edit_coupon" method="post">
                        <div class="modal-body">
                            <input type="hidden" name="couponId" value="${c.couponId}">
                            <div class="mb-3"><label class="form-label">Code</label><input type="text" class="form-control" name="code" value="${c.code}" required></div>
                            <div class="mb-3"><label class="form-label">Discount %</label><input type="number" class="form-control" name="discountPercentage" value="${c.discountPercentage}" step="0.01" min="1" max="100" required></div>
                            <div class="mb-3"><label class="form-label">Expiry Date</label><input type="date" class="form-control" name="expiryDate" value="${c.expiryDate}" required></div>
                            <div class="form-check"><input class="form-check-input" type="checkbox" name="isActive" ${c.active ? 'checked' : ''}><label class="form-check-label">Active</label></div>
                        </div>
                        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
                    </form>
                </div></div>
            </div>
        </c:forEach>

        <!-- Add Coupon Modal -->
        <div class="modal fade" id="addCouponModal" tabindex="-1">
            <div class="modal-dialog"><div class="modal-content">
                <div class="modal-header"><h5 class="modal-title">Add Coupon</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                <form action="${pageContext.request.contextPath}/admin/add_coupon" method="post" class="needs-validation" novalidate>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Code</label>
                            <input type="text" class="form-control" name="code" placeholder="e.g. SAVE20" pattern="^[A-Z0-9]{3,15}$" required>
                            <div class="invalid-feedback">Code must be 3-15 uppercase alphanumeric characters.</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Discount %</label>
                            <input type="number" class="form-control" name="discountPercentage" step="0.01" min="1" max="100" required>
                            <div class="invalid-feedback">Discount must be between 1 and 100.</div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Expiry Date</label>
                            <input type="date" class="form-control" name="expiryDate" id="addCouponDate" required>
                            <div class="invalid-feedback">Please select a valid expiry date.</div>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="isActive" checked>
                            <label class="form-check-label">Active</label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Add Coupon</button>
                    </div>
                </form>
            </div></div>
        </div>

        <script>
            // Set min expiry date to today
            document.getElementById('addCouponDate').setAttribute('min', new Date().toISOString().split('T')[0]);

            (function () {
                'use strict'
                var forms = document.querySelectorAll('.needs-validation')
                Array.prototype.slice.call(forms)
                    .forEach(function (form) {
                        form.addEventListener('submit', function (event) {
                            if (!form.checkValidity()) {
                                event.preventDefault()
                                event.stopPropagation()
                            }
                            form.classList.add('was-validated')
                        }, false)
                    })
            })()
        </script>
        <%@ include file="components/adminFooter.jsp" %>