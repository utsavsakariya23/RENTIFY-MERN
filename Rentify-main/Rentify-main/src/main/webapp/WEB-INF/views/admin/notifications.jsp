<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">Notifications</h2>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#sendNotificationModal"><i class="fas fa-bell me-2"></i>Send Notification</button>
            </div>
            <c:if test="${not empty param.success}">
                <div class="alert alert-success alert-dismissible fade show">${param.success}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
            </c:if>
            <div class="card card-modern border-0 p-4">
                <c:forEach var="n" items="${notifications}">
                    <div class="d-flex align-items-start mb-3 p-3 rounded-3" style="background:#f8f9fa;">
                        <i class="fas fa-bell text-primary mt-1 me-3"></i>
                        <div class="flex-grow-1">
                            <p class="mb-1">${n.message}</p>
                            <small class="text-muted"><fmt:formatDate value="${n.createdAt}" pattern="dd MMM yyyy HH:mm" /></small>
                        </div>
                        <form action="${pageContext.request.contextPath}/admin/delete_notification" method="post" onsubmit="return confirm('Delete?');">
                            <input type="hidden" name="notificationId" value="${n.notificationId}">
                        </form>
                    </div>
                </c:forEach>
                <c:if test="${empty notifications}">
                    <div class="text-center text-muted py-4">No notifications sent yet</div>
                </c:if>
                <c:if test="${totalPages > 1}">
                    <nav class="mt-3"><ul class="pagination justify-content-center">
                        <c:forEach begin="1" end="${totalPages}" var="i">
                            <li class="page-item ${currentPage == i ? 'active' : ''}"><a class="page-link" href="${pageContext.request.contextPath}/admin/notifications?page=${i}">${i}</a></li>
                        </c:forEach>
                    </ul></nav>
                </c:if>
            </div>

            <!-- Send Notification Modal -->
            <div class="modal fade" id="sendNotificationModal" tabindex="-1">
                <div class="modal-dialog"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Send Notification</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <form action="${pageContext.request.contextPath}/admin/send_notification" method="post">
                        <div class="modal-body">
                            <div class="mb-3"><label class="form-label">Message</label><textarea class="form-control" name="message" rows="4" placeholder="Enter notification message..." required></textarea></div>
                            <div class="form-check"><input class="form-check-input" type="checkbox" name="sendEmail" id="sendEmail"><label class="form-check-label" for="sendEmail">Also send via email (BCC to all customers)</label></div>
                        </div>
                        <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Send</button></div>
                    </form>
                </div></div>
            </div>
        </main>
        <%@ include file="components/adminFooter.jsp" %>