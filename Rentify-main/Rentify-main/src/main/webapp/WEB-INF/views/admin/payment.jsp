<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container my-5">
    <section>
        <h2 class="mb-4">Payments</h2>
        <p class="text-muted mb-4">
            This page will later show payment history and allow admins to manage transactions.
            For now, it provides a clean UI placeholder for your exam.
        </p>

        <table class="table table-bordered">
            <thead>
            <tr>
                <th>Payment ID</th>
                <th>Rent ID</th>
                <th>Customer ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
            </tr>
            </thead>
            <tbody>
            <!-- To be filled dynamically in backend part -->
            </tbody>
        </table>
    </section>
</main>

<%@ include file="components/adminFooter.jsp" %>