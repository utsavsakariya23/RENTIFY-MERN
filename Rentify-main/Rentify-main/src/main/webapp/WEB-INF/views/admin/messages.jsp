<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <h2 class="fw-bold mb-4">Contact Messages</h2>
            <c:if test="${not empty param.success}">
                <div class="alert alert-success alert-dismissible fade show">${param.success}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>
            </c:if>
            <div class="card card-modern border-0 p-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            <c:forEach var="m" items="${messages}">
                                <tr>
                                    <td>${m.messageId}</td>
                                    <td class="fw-bold">${m.name}</td>
                                    <td>${m.email}</td>
                                    <td>${m.subject}</td>
                                    <td style="max-width:200px;" class="text-truncate">${m.message}</td>
                                    <td>
                                        <c:choose>
                                            <c:when test="${m.status == 'Unread'}"><span class="badge bg-warning text-dark">Unread</span></c:when>
                                            <c:when test="${m.status == 'Replied'}"><span class="badge bg-success">Replied</span></c:when>
                                            <c:otherwise><span class="badge bg-secondary">${m.status}</span></c:otherwise>
                                        </c:choose>
                                    </td>
                                    <td class="small"><fmt:formatDate value="${m.createdAt}" pattern="dd MMM yyyy HH:mm" /></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#viewMsg${m.messageId}"><i class="fas fa-eye"></i></button>
                                        <c:if test="${m.status != 'Replied'}">
                                            <button class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#replyMsg${m.messageId}"><i class="fas fa-reply"></i></button>
                                        </c:if>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty messages}"><tr><td colspan="8" class="text-center text-muted py-4">No messages</td></tr></c:if>
                        </tbody>
                    </table>
                </div>

                <c:if test="${totalPages > 1}">
                    <nav class="mt-3"><ul class="pagination justify-content-center">
                        <c:forEach begin="1" end="${totalPages}" var="i">
                            <li class="page-item ${currentPage == i ? 'active' : ''}"><a class="page-link" href="${pageContext.request.contextPath}/admin/messages?page=${i}">${i}</a></li>
                        </c:forEach>
                    </ul></nav>
                </c:if>
            </div>
        </main>

        <!-- Modals rendered outside the main container to prevent z-index/Bootstrap rendering bugs -->
        <c:forEach var="m" items="${messages}">
            <!-- View Modal -->
            <div class="modal fade" id="viewMsg${m.messageId}" tabindex="-1">
                <div class="modal-dialog"><div class="modal-content">
                    <div class="modal-header"><h5 class="modal-title">Message from ${m.name}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <p><strong>Subject:</strong> ${m.subject}</p>
                        <p><strong>Email:</strong> ${m.email}</p>
                        <hr>
                        <p>${m.message}</p>
                        <c:if test="${not empty m.reply}"><hr><p class="text-success"><strong>Reply:</strong> ${m.reply}</p></c:if>
                    </div>
                </div></div>
            </div>
            <!-- Reply Modal -->
            <c:if test="${m.status != 'Replied'}">
                <div class="modal fade" id="replyMsg${m.messageId}" tabindex="-1">
                    <div class="modal-dialog"><div class="modal-content">
                        <div class="modal-header"><h5 class="modal-title">Reply to ${m.name}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                        <form action="${pageContext.request.contextPath}/admin/reply_message" method="post" class="needs-validation" novalidate>
                            <div class="modal-body">
                                <input type="hidden" name="messageId" value="${m.messageId}">
                                <p class="text-muted small"><strong>Original:</strong> ${m.message}</p>
                                <div class="mb-3">
                                    <label class="form-label fw-bold">Your Reply</label>
                                    <textarea class="form-control" name="reply" rows="4" placeholder="Type your reply..." minlength="10" maxlength="1000" required></textarea>
                                    <div class="invalid-feedback">Please enter a reply between 10 and 1000 characters.</div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" class="btn btn-success">Send Reply</button>
                            </div>
                        </form>
                    </div></div>
                </div>
            </c:if>
        </c:forEach>

        <script>
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