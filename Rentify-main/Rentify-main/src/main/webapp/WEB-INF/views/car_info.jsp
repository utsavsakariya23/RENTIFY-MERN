<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/header.jsp" %>

        <main class="container my-5 pt-5">
            <c:choose>
                <c:when test="${car != null}">
                    <div class="row">
                        <!-- Car Image -->
                        <div class="col-lg-6 mb-4">
                            <div class="card card-modern border-0 overflow-hidden">
                                <c:choose>
                                    <c:when test="${not empty car.imageUrl}">
                                        <img src="${car.imageUrl}" alt="${car.name}" class="w-100" style="max-height:400px;object-fit:cover;">
                                    </c:when>
                                    <c:otherwise>
                                        <div class="d-flex align-items-center justify-content-center" style="height:400px;background:#f0f0f0;">
                                            <i class="fas fa-car fa-5x text-muted"></i>
                                        </div>
                                    </c:otherwise>
                                </c:choose>
                            </div>
                        </div>

                        <!-- Car Details -->
                        <div class="col-lg-6 mb-4">
                            <h2 class="fw-bold">${car.name}</h2>
                            <p class="text-muted fs-5">${car.brand}</p>

                            <div class="mb-3">
                                <c:forEach begin="1" end="5" var="star">
                                    <i class="fas fa-star ${star <= car.averageRating ? 'text-warning' : 'text-muted'} fs-5"></i>
                                </c:forEach>
                                <span class="ms-2 text-muted">
                                    <fmt:formatNumber value="${car.averageRating}" pattern="#.#" /> / 5
                                    (${car.reviewCount} reviews)
                                </span>
                            </div>

                            <div class="mb-4">
                                <span class="h3 fw-bold text-primary">Rs. <fmt:formatNumber value="${car.pricePerDay}" pattern="#,##0" /></span>
                                <span class="text-muted">/day</span>
                            </div>

                            <table class="table table-borderless mb-4">
                                <tr><td class="text-muted"><i class="fas fa-gas-pump me-2"></i>Fuel Type</td><td class="fw-bold">${car.fuelType}</td></tr>
                                <tr><td class="text-muted"><i class="fas fa-cog me-2"></i>Transmission</td><td class="fw-bold">${car.transmission}</td></tr>
                                <tr>
                                    <td class="text-muted"><i class="fas fa-info-circle me-2"></i>Status</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${car.status == 'Available'}"><span class="badge bg-success">Available</span></c:when>
                                            <c:when test="${car.status == 'Booked'}"><span class="badge bg-warning text-dark">Currently Booked</span></c:when>
                                            <c:when test="${car.status == 'Service'}"><span class="badge bg-danger">Under Service</span></c:when>
                                        </c:choose>
                                    </td>
                                </tr>
                            </table>

                            <c:if test="${car.status == 'Available'}">
                                <a href="${pageContext.request.contextPath}/booking?carId=${car.carId}" class="btn btn-primary-custom btn-lg w-100 py-3 fw-bold">
                                    <i class="fas fa-calendar-check me-2"></i>Book Now
                                </a>
                            </c:if>
                            <c:if test="${car.status != 'Available'}">
                                <button class="btn btn-secondary btn-lg w-100 py-3" disabled>
                                    <i class="fas fa-ban me-2"></i>Not Available
                                </button>
                            </c:if>
                        </div>
                    </div>

                    <!-- Reviews Section -->
                    <div class="row mt-5">
                        <div class="col-12">
                            <h4 class="fw-bold mb-4"><i class="fas fa-star text-warning me-2"></i>Customer Reviews (${car.reviewCount})</h4>
                            <c:forEach var="r" items="${reviews}">
                                <div class="card card-modern border-0 mb-3 p-3">
                                    <div class="d-flex justify-content-between">
                                        <div>
                                            <strong>${r.userName}</strong>
                                            <div class="mt-1">
                                                <c:forEach begin="1" end="5" var="star">
                                                    <i class="fas fa-star ${star <= r.rating ? 'text-warning' : 'text-muted'} small"></i>
                                                </c:forEach>
                                            </div>
                                        </div>
                                        <small class="text-muted"><fmt:formatDate value="${r.createdAt}" pattern="dd MMM yyyy" /></small>
                                    </div>
                                    <p class="mt-2 mb-0 text-muted">${r.comment}</p>
                                </div>
                            </c:forEach>
                            <c:if test="${empty reviews}">
                                <p class="text-muted">No reviews yet for this vehicle.</p>
                            </c:if>
                        </div>
                    </div>
                </c:when>
                <c:otherwise>
                    <div class="text-center py-5">
                        <i class="fas fa-car fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">Car not found.</h5>
                        <a href="${pageContext.request.contextPath}/vehicles" class="btn btn-primary-custom">Browse Cars</a>
                    </div>
                </c:otherwise>
            </c:choose>
        </main>

    <%@ include file="components/footer.jsp" %>