<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">Manage Vehicles</h2>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addCarModal">
                    <i class="fas fa-plus me-2"></i>Add Vehicle
                </button>
            </div>

            <c:if test="${not empty param.success}">
                <div class="alert alert-success alert-dismissible fade show">${param.success}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            </c:if>

            <div class="card card-modern border-0 p-4">
                <!-- AJAX Search -->
                <div class="mb-3 d-flex gap-2 align-items-center">
                    <div class="input-group" style="max-width: 400px;">
                        <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
                        <input type="text" id="vehicleSearch" class="form-control" placeholder="Search by name, brand, status..." autocomplete="off">
                        <button class="btn btn-outline-secondary" onclick="clearSearch('vehicleSearch', 'vehicleTbody', 'noVehicleRow')" title="Clear"><i class="fas fa-times"></i></button>
                    </div>
                    <span id="vehicleSearchCount" class="text-muted small"></span>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Price/Day</th>
                                <th>Fuel</th>
                                <th>Transmission</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="vehicleTbody">
                            <c:forEach var="car" items="${cars}">
                                <tr>
                                    <td>${car.carId}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${not empty car.imageUrl}">
                                                <img src="${car.imageUrl}" alt="${car.name}" class="rounded" style="width:60px;height:40px;object-fit:cover;">
                                            </c:when>
                                            <c:otherwise>
                                                <div class="rounded d-flex align-items-center justify-content-center" style="width:60px;height:40px;background:#e9ecef;">
                                                    <i class="fas fa-car text-muted"></i>
                                                </div>
                                            </c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td class="fw-bold">${car.name}</td>
                                    <td>${car.brand}</td>
                                    <td>Rs. <fmt:formatNumber value="${car.pricePerDay}" pattern="#,##0" /></td>
                                    <td>${car.fuelType}</td>
                                    <td>${car.transmission}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${car.status == 'Available'}"><span class="badge bg-success">Available</span></c:when>
                                            <c:when test="${car.status == 'Booked'}"><span class="badge bg-warning text-dark">Booked</span></c:when>
                                            <c:when test="${car.status == 'Service'}"><span class="badge bg-danger">Service</span></c:when>
                                        </c:choose>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#editCarModal${car.carId}"><i class="fas fa-edit"></i></button>
                                        <form action="${pageContext.request.contextPath}/admin/delete_car" method="post" style="display:inline;" onsubmit="return confirm('Delete this car?');">
                                            <input type="hidden" name="carId" value="${car.carId}">
                                            <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>


                            </c:forEach>
                            <c:if test="${empty cars}">
                                <tr><td colspan="9" class="text-center text-muted py-4">No vehicles found</td></tr>
                            </c:if>
                        </tbody>
                    </table>
                </div>


                <!-- Pagination -->
                <c:if test="${totalPages > 1}">
                    <nav class="mt-3">
                        <ul class="pagination justify-content-center">
                            <c:forEach begin="1" end="${totalPages}" var="i">
                                <li class="page-item ${currentPage == i ? 'active' : ''}">
                                    <a class="page-link" href="${pageContext.request.contextPath}/admin/vehicles?page=${i}">${i}</a>
                                </li>
                            </c:forEach>
                        </ul>
                    </nav>
                </c:if>
            </div>
        </main>

        <!-- Edit Modals (outside main container to prevent z-index/Bootstrap rendering bugs) -->
        <c:forEach var="car" items="${cars}">
            <div class="modal fade" id="editCarModal${car.carId}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header"><h5 class="modal-title">Edit Vehicle</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <form action="${pageContext.request.contextPath}/admin/edit_car" method="post">
                            <div class="modal-body">
                                <input type="hidden" name="carId" value="${car.carId}">
                                <div class="mb-3"><label class="form-label">Name</label><input type="text" class="form-control" name="name" value="${car.name}" required></div>
                                <div class="mb-3"><label class="form-label">Brand</label><input type="text" class="form-control" name="brand" value="${car.brand}" required></div>
                                <div class="mb-3"><label class="form-label">Price/Day</label><input type="number" class="form-control" name="pricePerDay" value="${car.pricePerDay}" step="0.01" required></div>
                                <div class="mb-3"><label class="form-label">Fuel Type</label>
                                    <select class="form-select" name="fuelType">
                                        <option value="Petrol" ${car.fuelType == 'Petrol' ? 'selected' : ''}>Petrol</option>
                                        <option value="Diesel" ${car.fuelType == 'Diesel' ? 'selected' : ''}>Diesel</option>
                                        <option value="Electric" ${car.fuelType == 'Electric' ? 'selected' : ''}>Electric</option>
                                        <option value="Hybrid" ${car.fuelType == 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                                    </select>
                                </div>
                                <div class="mb-3"><label class="form-label">Transmission</label>
                                    <select class="form-select" name="transmission">
                                        <option value="Automatic" ${car.transmission == 'Automatic' ? 'selected' : ''}>Automatic</option>
                                        <option value="Manual" ${car.transmission == 'Manual' ? 'selected' : ''}>Manual</option>
                                    </select>
                                </div>
                                <div class="mb-3"><label class="form-label">Status</label>
                                    <select class="form-select" name="status">
                                        <option value="Available" ${car.status == 'Available' ? 'selected' : ''}>Available</option>
                                        <option value="Booked" ${car.status == 'Booked' ? 'selected' : ''}>Booked</option>
                                        <option value="Service" ${car.status == 'Service' ? 'selected' : ''}>Service</option>
                                    </select>
                                </div>
                                <div class="mb-3"><label class="form-label">Image URL</label><input type="text" class="form-control" name="imageUrl" value="${car.imageUrl}"></div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </c:forEach>
            <div class="modal fade" id="addCarModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header"><h5 class="modal-title">Add New Vehicle</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <form action="${pageContext.request.contextPath}/admin/add_car" method="post" class="needs-validation" novalidate>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input type="text" class="form-control" name="name" placeholder="e.g. Toyota Corolla" minlength="2" maxlength="50" required>
                                    <div class="invalid-feedback">Please enter a valid vehicle name (2-50 characters).</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Brand</label>
                                    <input type="text" class="form-control" name="brand" placeholder="e.g. Toyota" minlength="2" maxlength="30" required>
                                    <div class="invalid-feedback">Please enter a valid brand name.</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Price/Day (Rs.)</label>
                                    <input type="number" class="form-control" name="pricePerDay" step="0.01" min="1" required>
                                    <div class="invalid-feedback">Price must be greater than 0.</div>
                                </div>
                                <div class="mb-3"><label class="form-label">Fuel Type</label>
                                    <select class="form-select" name="fuelType" required>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div class="mb-3"><label class="form-label">Transmission</label>
                                    <select class="form-select" name="transmission" required>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Image URL</label>
                                    <input type="url" class="form-control" name="imageUrl" placeholder="https://..." required>
                                    <div class="invalid-feedback">Please enter a valid image URL.</div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-primary">Add Vehicle</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>


            <script>
                (function() {
                    var CTX_PATH = '${pageContext.request.contextPath}';
                    var searchTimer;
                    var searchInput = document.getElementById('vehicleSearch');
                    if (searchInput) {
                        searchInput.addEventListener('input', function() {
                            clearTimeout(searchTimer);
                            var q = this.value.trim();
                            searchTimer = setTimeout(function() { searchVehicles(q); }, 300);
                        });
                    }

                    function statusBadge(s) {
                        if (s === 'Available') return '<span class="badge bg-success">Available</span>';
                        if (s === 'Booked')    return '<span class="badge bg-warning text-dark">Booked</span>';
                        return '<span class="badge bg-danger">Service</span>';
                    }

                    window.searchVehicles = function(q) {
                        if (!q) { location.reload(); return; }
                        var tbody = document.getElementById('vehicleTbody');
                        var countEl = document.getElementById('vehicleSearchCount');
                        fetch(CTX_PATH + '/admin/api/search_vehicles?q=' + encodeURIComponent(q))
                            .then(function(r) { return r.json(); })
                            .then(function(data) {
                                if (countEl) countEl.textContent = data.length + ' result(s)';
                                if (!tbody) return;
                                if (data.length === 0) {
                                    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No vehicles match your search</td></tr>';
                                    return;
                                }
                                var html = '';
                                for (var i = 0; i < data.length; i++) {
                                    var c = data[i];
                                    var imgHtml = c.imageUrl
                                        ? '<img src="' + c.imageUrl + '" style="width:60px;height:40px;object-fit:cover;border-radius:4px">'
                                        : '<i class="fas fa-car text-muted"></i>';
                                    html += '<tr>'
                                        + '<td>' + c.carId + '</td>'
                                        + '<td>' + imgHtml + '</td>'
                                        + '<td class="fw-bold">' + (c.name || '') + '</td>'
                                        + '<td>' + (c.brand || '') + '</td>'
                                        + '<td>Rs. ' + parseInt(c.pricePerDay).toLocaleString() + '</td>'
                                        + '<td>' + (c.fuelType || '') + '</td>'
                                        + '<td>' + (c.transmission || '') + '</td>'
                                        + '<td>' + statusBadge(c.status) + '</td>'
                                        + '<td><a href="' + CTX_PATH + '/admin/vehicles" class="btn btn-sm btn-outline-secondary">View</a></td>'
                                        + '</tr>';
                                }
                                tbody.innerHTML = html;
                            }).catch(function() {});
                    };

                    window.clearSearch = function(inputId) {
                        var el = document.getElementById(inputId);
                        if (el) el.value = '';
                        location.reload();
                    };

                    // Form validation
                    (function () {
                        'use strict';
                        var forms = document.querySelectorAll('.needs-validation');
                        Array.prototype.slice.call(forms).forEach(function (form) {
                            form.addEventListener('submit', function (event) {
                                if (!form.checkValidity()) { event.preventDefault(); event.stopPropagation(); }
                                form.classList.add('was-validated');
                            }, false);
                        });
                    })();
                })();
            </script>

        <%@ include file="components/adminFooter.jsp" %>