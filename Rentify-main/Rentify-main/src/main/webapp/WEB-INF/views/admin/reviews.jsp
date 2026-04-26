<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
    <%@ include file="components/adminHeader.jsp" %>

        <main class="container-fluid my-5">
            <h2 class="fw-bold mb-4">Customer Reviews</h2>
            <div class="card card-modern border-0 p-4">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr><th>ID</th><th>Customer</th><th>Car</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            <c:forEach var="r" items="${reviews}">
                                <tr>
                                    <td>${r.reviewId}</td>
                                    <td class="fw-bold">${r.userName}</td>
                                    <td>${r.carName}</td>
                                    <td>
                                        <c:forEach begin="1" end="5" var="star">
                                            <i class="fas fa-star ${star <= r.rating ? 'text-warning' : 'text-muted'}"></i>
                                        </c:forEach>
                                        <span class="ms-1 small">(${r.rating})</span>
                                    </td>
                                    <td style="max-width:250px;" class="text-truncate">${r.comment}</td>
                                    <td class="small"><fmt:formatDate value="${r.createdAt}" pattern="dd MMM yyyy" /></td>
                                    <td>
                                        <form action="${pageContext.request.contextPath}/admin/delete_review" method="post" style="display:inline;" onsubmit="return confirm('Delete this review?');">
                                            <input type="hidden" name="reviewId" value="${r.reviewId}">
                                            <button class="btn btn-sm btn-outline-danger"><i class="fas fa-trash"></i></button>
                                        </form>
                                    </td>
                                </tr>
                            </c:forEach>
                            <c:if test="${empty reviews}"><tr><td colspan="7" class="text-center text-muted py-4">No reviews yet</td></tr></c:if>
                        </tbody>
                    </table>
                </div>
                <c:if test="${totalPages > 1}">
                    <nav class="mt-3"><ul class="pagination justify-content-center">
                        <c:forEach begin="1" end="${totalPages}" var="i">
                            <li class="page-item ${currentPage == i ? 'active' : ''}"><a class="page-link" href="${pageContext.request.contextPath}/admin/reviews?page=${i}">${i}</a></li>
                        </c:forEach>
                    </ul></nav>
                </c:if>
            </div>
        </main>
        <%@ include file="components/adminFooter.jsp" %>
