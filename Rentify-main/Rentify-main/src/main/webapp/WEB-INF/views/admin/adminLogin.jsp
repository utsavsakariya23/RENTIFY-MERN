<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container mt-5" style="max-width:400px;">
    <h3 class="mb-4">Admin Login</h3>
    <form>
        <input type="text" class="form-control mb-3" placeholder="Username">
        <input type="password" class="form-control mb-3" placeholder="Password">
        <button class="btn btn-dark w-100">Login</button>
    </form>
</main>

<%@ include file="components/adminFooter.jsp" %>