<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <%@ taglib prefix="c" uri="jakarta.tags.core" %>
        <%@ include file="components/adminHeader.jsp" %>

                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-8">
                            <div class="card border-0 shadow-sm">
                                <div class="card-header bg-white py-3">
                                    <h5 class="mb-0 fw-bold"><i class="fas fa-user-circle text-primary me-2"></i>Admin
                                        Profile</h5>
                                </div>
                                <div class="card-body p-4">
                                    <c:if test="${param.success == 'profile_updated'}">
                                        <div class="alert alert-success alert-dismissible fade show">
                                            Profile updated successfully.
                                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                        </div>
                                    </c:if>
                                    <c:if test="${param.error == 'update_failed'}">
                                        <div class="alert alert-danger alert-dismissible fade show">
                                            Failed to update profile.
                                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                                        </div>
                                    </c:if>
                                    <div class="text-center mb-4">
                                        <div class="display-1 text-secondary mb-3"><i class="fas fa-user-circle"></i></div>
                                        <h3 class="fw-bold">${sessionScope.loggedUser.fullName}</h3>
                                        <span class="badge bg-primary">${sessionScope.loggedUser.role}</span>
                                    </div>

                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label text-muted small">USERNAME</label>
                                            <input type="text" class="form-control" value="${sessionScope.loggedUser.username}" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted small">EMAIL</label>
                                            <input type="text" class="form-control" value="${sessionScope.loggedUser.email}" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted small">PHONE</label>
                                            <input type="text" class="form-control" value="${sessionScope.loggedUser.phone}" readonly>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label text-muted small">JOINED DATE</label>
                                            <input type="text" class="form-control" value="<fmt:formatDate value='${sessionScope.loggedUser.createdAt}' pattern='dd MMM yyyy' />" readonly>
                                        </div>
                                    </div>

                                    <div class="d-flex justify-content-end mt-4">
                                        <button class="btn btn-outline-primary me-2" data-bs-toggle="modal" data-bs-target="#editProfileModal">
                                            <i class="fas fa-edit me-1"></i> Edit Profile
                                        </button>
                                        <button class="btn btn-primary-custom" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
                                            <i class="fas fa-key me-1"></i> Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Edit Profile Modal -->
                <div class="modal fade" id="editProfileModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Profile</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form action="${pageContext.request.contextPath}/admin/update_profile" method="post">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name</label>
                                        <input type="text" class="form-control" name="fullName" value="${sessionScope.loggedUser.fullName}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Phone</label>
                                        <input type="text" class="form-control" name="phone" value="${sessionScope.loggedUser.phone}" required maxlength="10">
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Change Password Modal -->
                <div class="modal fade" id="changePasswordModal" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Change Password</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <form id="changePasswordForm">
                                <div class="modal-body">
                                    <div class="mb-3">
                                        <label class="form-label">Current Password</label>
                                        <input type="password" class="form-control" name="currentPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">New Password</label>
                                        <input type="password" class="form-control" name="newPassword" id="newPassword" required minlength="8">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control" name="confirmNewPassword" id="confirmNewPassword" required>
                                    </div>
                                    <div id="passwordError" class="text-danger small mt-2" style="display:none;"></div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" class="btn btn-primary-custom">Update Password</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <script>
                    document.getElementById('changePasswordForm').addEventListener('submit', function(e) {
                        e.preventDefault();
                        const pwd = document.getElementById('newPassword').value;
                        const confirmPwd = document.getElementById('confirmNewPassword').value;
                        const err = document.getElementById('passwordError');

                        if (pwd !== confirmPwd) {
                            err.textContent = "New passwords do not match.";
                            err.style.display = 'block';
                            return;
                        }
                        err.style.display = 'none';

                        if (typeof showGlobalLoader === 'function') showGlobalLoader();

                        const formData = new URLSearchParams(new FormData(this));
                        fetch('${pageContext.request.contextPath}/admin/change_password', {
                            method: 'POST',
                            body: formData
                        })
                        .then(r => r.json())
                        .then(data => {
                            if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
                            if (data.success) {
                                bootstrap.Modal.getInstance(document.getElementById('changePasswordModal')).hide();
                                showSuccessModal('Password Updated', data.message, function() {
                                    // Optionally redirect to login if required
                                });
                                document.getElementById('changePasswordForm').reset();
                            } else {
                                err.textContent = data.message;
                                err.style.display = 'block';
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            if (typeof hideGlobalLoader === 'function') hideGlobalLoader();
                            showToast('An error occurred.', 'error');
                        });
                    });
                </script>
                        </div>
                    </div>
                </div>

                <%@ include file="components/adminFooter.jsp" %>