<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/header.jsp" %>

        <main class="container my-5 pt-5">
            <c:if test="${not empty param.error}">
                <div class="alert alert-danger alert-dismissible fade show">${param.error}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            </c:if>

            <div class="row">
                <!-- Sidebar Filters -->
                <div class="col-lg-3 mb-4">
                    <div class="glass-panel p-4 rounded-3 sticky-top" style="top: 100px; background: white;">
                        <form action="${pageContext.request.contextPath}/vehicles" method="get" id="filterForm">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="fw-bold mb-0">Filters</h5>
                                <a href="${pageContext.request.contextPath}/vehicles" class="btn btn-sm btn-link text-decoration-none">Reset</a>
                            </div>

                            <!-- Search -->
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted">SEARCH</label>
                                <input type="text" class="form-control form-control-sm" name="keyword" placeholder="Search by name or brand..." value="${param.keyword}">
                            </div>

                            <!-- Fuel Type -->
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted">FUEL TYPE</label>
                                <select class="form-select form-select-sm" name="fuelType">
                                    <option value="">All</option>
                                    <option value="Petrol" ${param.fuelType == 'Petrol' ? 'selected' : ''}>Petrol</option>
                                    <option value="Diesel" ${param.fuelType == 'Diesel' ? 'selected' : ''}>Diesel</option>
                                    <option value="Electric" ${param.fuelType == 'Electric' ? 'selected' : ''}>Electric</option>
                                    <option value="Hybrid" ${param.fuelType == 'Hybrid' ? 'selected' : ''}>Hybrid</option>
                                </select>
                            </div>

                            <!-- Transmission -->
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted">TRANSMISSION</label>
                                <select class="form-select form-select-sm" name="transmission">
                                    <option value="">All</option>
                                    <option value="Automatic" ${param.transmission == 'Automatic' ? 'selected' : ''}>Automatic</option>
                                    <option value="Manual" ${param.transmission == 'Manual' ? 'selected' : ''}>Manual</option>
                                </select>
                            </div>

                            <!-- Max Price -->
                            <div class="mb-4">
                                <label class="form-label fw-bold small text-muted">MAX PRICE (PER DAY)</label>
                                <input type="number" class="form-control form-control-sm" name="maxPrice" placeholder="e.g. 10000" value="${param.maxPrice}">
                            </div>

                            <button type="submit" class="btn btn-primary-custom w-100">Apply Filters</button>
                        </form>
                    </div>
                </div>

                <!-- Vehicle Grid -->
                <div class="col-lg-9">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="fw-bold">Available Vehicles <span class="text-muted fs-6">(${carCount})</span></h4>
                    </div>

                    <div class="row g-4" id="vehicleGrid">
                        <c:forEach var="car" items="${cars}">
                            <div class="col-md-6 col-lg-4">
                                <div class="card card-modern h-100">
                                    <div class="card-img-wrapper position-relative">
                                        <span class="badge bg-success position-absolute top-0 start-0 m-3">${car.status}</span>
                                        <c:choose>
                                            <c:when test="${not empty car.imageUrl}">
                                                <img src="${car.imageUrl}" alt="${car.name}">
                                            </c:when>
                                            <c:otherwise>
                                                <div class="d-flex align-items-center justify-content-center" style="height:180px;background:#f0f0f0;">
                                                    <i class="fas fa-car fa-3x text-muted"></i>
                                                </div>
                                            </c:otherwise>
                                        </c:choose>
                                    </div>
                                    <div class="card-body p-4">
                                        <div class="d-flex justify-content-between mb-2">
                                            <h5 class="card-title fw-bold">${car.name}</h5>
                                            <div class="text-warning small">
                                                <i class="fas fa-star"></i>
                                                <fmt:formatNumber value="${car.averageRating}" pattern="#.#" />
                                                <span class="text-muted">(${car.reviewCount})</span>
                                            </div>
                                        </div>
                                        <p class="text-muted small mb-3">${car.brand} &bull; ${car.transmission} &bull; ${car.fuelType}</p>
                                        <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                            <div>
                                                <span class="h5 fw-bold text-primary">Rs. <fmt:formatNumber value="${car.pricePerDay}" pattern="#,##0" /></span>
                                                <span class="text-muted small">/day</span>
                                            </div>
                                            <a href="${pageContext.request.contextPath}/car_info?id=${car.carId}" class="btn btn-sm btn-primary-custom rounded-pill px-3">View Details</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </c:forEach>
                    </div>

                    <c:if test="${empty cars}">
                        <div class="text-center py-5">
                            <i class="fas fa-search fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No vehicles found matching your criteria.</h5>
                            <a href="${pageContext.request.contextPath}/vehicles" class="btn btn-link">Clear Filters</a>
                        </div>
                    </c:if>
                </div>
            </div>
        </main>

        <%@ include file="components/footer.jsp" %>