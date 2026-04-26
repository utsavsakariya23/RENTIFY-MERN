<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container-fluid my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold mb-0">🔧 Fleet Maintenance</h2>
            <p class="text-muted small mb-0">Track service schedules, insurance, and vehicle health</p>
        </div>
    </div>

    <c:if test="${not empty param.success}">
        <div class="alert alert-success alert-dismissible fade show"><i class="fas fa-check me-2"></i>${param.success}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
    </c:if>

    <!-- Fleet Stats -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-center" style="border-left: 4px solid #198754 !important;">
                <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                <h4 class="fw-bold" id="statusOkCount">-</h4>
                <div class="small text-muted">Fleet OK</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-center" style="border-left: 4px solid #ffc107 !important;">
                <i class="fas fa-exclamation-triangle fa-2x text-warning mb-2"></i>
                <h4 class="fw-bold" id="statusDueCount">-</h4>
                <div class="small text-muted">Service Due Soon</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-center" style="border-left: 4px solid #dc3545 !important;">
                <i class="fas fa-tools fa-2x text-danger mb-2"></i>
                <h4 class="fw-bold" id="statusOverdueCount">-</h4>
                <div class="small text-muted">Overdue / In Service</div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm p-3 text-center" style="border-left: 4px solid #0d6efd !important;">
                <i class="fas fa-shield-alt fa-2x text-primary mb-2"></i>
                <h4 class="fw-bold" id="insuranceExpCount">-</h4>
                <div class="small text-muted">Insurance Expiring</div>
            </div>
        </div>
    </div>

    <!-- Fleet Table -->
    <div class="card card-modern border-0 p-4">
        <div class="table-responsive">
            <table class="table table-hover align-middle" id="fleetTable">
                <thead class="table-light text-uppercase small">
                    <tr>
                        <th>Car</th>
                        <th>Status</th>
                        <th>Total Bookings</th>
                        <th>Mileage</th>
                        <th>Last Service</th>
                        <th>Next Service</th>
                        <th>Insurance Expiry</th>
                        <th>Health</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <c:forEach var="car" items="${fleetCars}">
                        <tr data-next-service="${car.nextServiceDate}" data-insurance="${car.insuranceExpiry}" data-status="${car.status}">
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <c:if test="${not empty car.imageUrl}">
                                        <img src="${car.imageUrl}" style="width:45px;height:30px;object-fit:cover;border-radius:6px;">
                                    </c:if>
                                    <div>
                                        <div class="fw-bold">${car.brand} ${car.name}</div>
                                        <small class="text-muted">${car.fuelType} · ${car.transmission}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${car.status == 'Available'}"><span class="badge bg-success">Available</span></c:when>
                                    <c:when test="${car.status == 'Service'}"><span class="badge bg-danger">In Service</span></c:when>
                                    <c:otherwise><span class="badge bg-warning text-dark">Booked</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td><span class="badge bg-primary">${car.totalBookings}</span></td>
                            <td>${car.mileage != null ? car.mileage : '<span class="text-muted">N/A</span>'} <c:if test="${car.mileage != null}">km</c:if></td>
                            <td>
                                <c:choose>
                                    <c:when test="${car.lastServiceDate != null}"><fmt:formatDate value="${car.lastServiceDate}" pattern="dd MMM yyyy"/></c:when>
                                    <c:otherwise><span class="text-muted fst-italic">Not set</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${car.nextServiceDate != null}"><fmt:formatDate value="${car.nextServiceDate}" pattern="dd MMM yyyy"/></c:when>
                                    <c:otherwise><span class="text-muted fst-italic">Not set</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td>
                                <c:choose>
                                    <c:when test="${car.insuranceExpiry != null}"><fmt:formatDate value="${car.insuranceExpiry}" pattern="dd MMM yyyy"/></c:when>
                                    <c:otherwise><span class="text-muted fst-italic">Not set</span></c:otherwise>
                                </c:choose>
                            </td>
                            <td class="health-badge">—</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal"
                                    data-bs-target="#fleetModal${car.carId}"><i class="fas fa-edit"></i> Update</button>
                            </td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty fleetCars}">
                        <tr><td colspan="9" class="text-center text-muted py-5">No vehicles in fleet</td></tr>
                    </c:if>
                </tbody>
            </table>
        </div>
    </div>
</main>

<!-- Fleet Update Modals -->
<c:forEach var="car" items="${fleetCars}">
    <div class="modal fade" id="fleetModal${car.carId}" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header"><h5 class="modal-title">Update Fleet — ${car.brand} ${car.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                <form action="${pageContext.request.contextPath}/admin/update_fleet" method="post">
                    <input type="hidden" name="carId" value="${car.carId}">
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Car Status</label>
                            <select name="status" class="form-select">
                                <option value="Available" ${car.status == 'Available' ? 'selected' : ''}>Available</option>
                                <option value="Service" ${car.status == 'Service' ? 'selected' : ''}>In Service</option>
                                <option value="Booked" ${car.status == 'Booked' ? 'selected' : ''}>Booked</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Last Service Date</label>
                            <input type="date" name="lastServiceDate" class="form-control" value="${car.lastServiceDate}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Next Service Due</label>
                            <input type="date" name="nextServiceDate" class="form-control" value="${car.nextServiceDate}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Insurance Expiry Date</label>
                            <input type="date" name="insuranceExpiry" class="form-control" value="${car.insuranceExpiry}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Current Mileage (km)</label>
                            <input type="number" name="mileage" class="form-control" value="${car.mileage}" min="0" placeholder="e.g. 45000">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save me-1"></i>Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</c:forEach>

<script>
// Calculate health status for each row + update stats
const today = new Date();
today.setHours(0,0,0,0);
const soon = new Date(today);
soon.setDate(soon.getDate() + 30);

let okCount = 0, dueCount = 0, overdueCount = 0, insExpCount = 0;
document.querySelectorAll('#fleetTable tbody tr[data-status]').forEach(row => {
    const ns = row.dataset.nextService;
    const ins = row.dataset.insurance;
    const status = row.dataset.status;
    const badge = row.querySelector('.health-badge');
    let health = 'OK';

    if (status === 'Service') { health = 'IN SERVICE'; overdueCount++; }
    else if (ns) {
        const d = new Date(ns);
        if (d < today) { health = 'OVERDUE'; overdueCount++; }
        else if (d <= soon) { health = 'DUE SOON'; dueCount++; }
        else { health = 'OK'; okCount++; }
    } else { health = 'NO DATA'; okCount++; }

    if (ins) {
        const id = new Date(ins);
        if (id <= soon) insExpCount++;
    }

    const colorMap = { 'OK': 'success', 'DUE SOON': 'warning', 'OVERDUE': 'danger', 'IN SERVICE': 'danger', 'NO DATA': 'secondary' };
    badge.innerHTML = '<span class="badge bg-' + (colorMap[health] || 'secondary') + '">' + health + '</span>';
});

document.getElementById('statusOkCount').textContent = okCount;
document.getElementById('statusDueCount').textContent = dueCount;
document.getElementById('statusOverdueCount').textContent = overdueCount;
document.getElementById('insuranceExpCount').textContent = insExpCount;
</script>

<%@ include file="components/adminFooter.jsp" %>
