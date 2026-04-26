<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <%@ include file="components/header.jsp" %>

        <main class="d-flex align-items-center" style="min-height: 80vh; padding-top: 80px; background-color: #f8f9fa;">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-5 col-lg-4">
                        <div class="card card-modern border-0 p-4 shadow-lg">
                            <div class="text-center mb-4">
                                <h3 class="fw-bold text-dark">Welcome Back</h3>
                                <p class="text-muted small">Please login to your account</p>
                            </div>

                            <% if ("true".equals(request.getParameter("registered"))) { %>
                            <div class="alert alert-success alert-dismissible fade show" role="alert">
                                <i class="fas fa-check-circle me-2"></i>Registration successful! Please login.
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                            <% } %>

                            <% if ("true".equals(request.getParameter("error"))) { %>
                            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <i class="fas fa-exclamation-circle me-2"></i>Invalid username or password.
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                            <% } %>

                            <% if ("true".equals(request.getParameter("logout"))) { %>
                            <div class="alert alert-info alert-dismissible fade show" role="alert">
                                <i class="fas fa-info-circle me-2"></i>You have been logged out.
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                            <% } %>

                            <form id="loginForm" action="${pageContext.request.contextPath}/perform_login" method="post">

                                <div class="mb-3">
                                    <label class="form-label small fw-bold text-muted">USERNAME</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0"><i
                                                class="fas fa-user text-primary"></i></span>
                                        <input type="text" class="form-control border-start-0 ps-0" name="username"
                                            placeholder="Enter username"
                                            value="<%= request.getCookies() != null ? getCookieValue(request.getCookies(), "rememberUser", "") : "" %>">
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <label class="form-label small fw-bold text-muted">PASSWORD</label>
                                    <div class="input-group">
                                        <span class="input-group-text bg-white border-end-0"><i
                                                class="fas fa-lock text-primary"></i></span>
                                        <input type="password" class="form-control border-start-0 ps-0" name="password"
                                            placeholder="Enter password">
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" name="rememberMe" id="rememberMe"
                                            <%= request.getCookies() != null && !getCookieValue(request.getCookies(), "rememberUser", "").isEmpty() ? "checked" : "" %>>
                                        <label class="form-check-label small" for="rememberMe">Remember Me</label>
                                    </div>
                                    <a href="#" class="small text-decoration-none text-primary">Forgot Password?</a>
                                </div>

                                <button type="submit" class="btn btn-primary-custom w-100 py-2 mb-3 shadow">LOG
                                    IN</button>

                                <div class="text-center">
                                    <span class="text-muted small">Don't have an account?</span>
                                    <a href="${pageContext.request.contextPath}/register"
                                        class="fw-bold text-decoration-none ms-1">Register Now</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <script src="${pageContext.request.contextPath}/assets/js/validation.js"></script>

        <%!
            private String getCookieValue(jakarta.servlet.http.Cookie[] cookies, String name, String defaultVal) {
                if (cookies != null) {
                    for (jakarta.servlet.http.Cookie c : cookies) {
                        if (name.equals(c.getName())) return c.getValue();
                    }
                }
                return defaultVal;
            }
        %>

        <%@ include file="components/footer.jsp" %>