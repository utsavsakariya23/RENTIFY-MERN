<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container my-5" onload="loadCustomerDetails()">
    <!-- Admin can add/update/delete customers -->
    <section class="mb-4">
        <h2 class="mb-3">Manage Customers</h2>
        <form id="customerForm">
            <div class="row">
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="fw-bold" for="customerId">Customer ID</label>
                        <input type="text" id="customerId" class="form-control" placeholder="C001">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerName">Name</label>
                        <input type="text" id="customerName" class="form-control" placeholder="Full name">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerAddress">Address</label>
                        <input type="text" id="customerAddress" class="form-control" placeholder="Address">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="fw-bold" for="customerContact">Contact No</label>
                        <input type="text" id="customerContact" class="form-control" placeholder="Phone number">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerEmail">Email</label>
                        <input type="email" id="customerEmail" class="form-control" placeholder="Email">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerLicence">Licence No</label>
                        <input type="text" id="customerLicence" class="form-control" placeholder="Licence number">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="mb-3">
                        <label class="fw-bold" for="customerNic">NIC No</label>
                        <input type="text" id="customerNic" class="form-control" placeholder="NIC number">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerUsername">Username</label>
                        <input type="text" id="customerUsername" class="form-control" placeholder="Username">
                    </div>
                    <div class="mb-3">
                        <label class="fw-bold" for="customerPassword">Password</label>
                        <input type="password" id="customerPassword" class="form-control" placeholder="Password">
                    </div>
                </div>
            </div>
            <div class="mt-2">
                <button type="button" class="btn btn-theme fw-bold" id="customerSaveBtn">Save</button>
                <button type="button" class="btn btn-danger fw-bold" id="customerDeleteBtn">Delete</button>
            </div>
        </form>
    </section>
 
    <section id="rentRequestTable">
        <div class="container">
            <h2>Customer List</h2>
            <table class="table table-bordered" id="customerDetailsTable">
                <thead>
                <tr>
                    <th>Customer ID</th>
                    <th>Address</th>
                    <th>Contact No</th>
                    <th>Email</th>
                    <th>Licence No</th>
                    <th>Name</th>
                    <th>Password</th>
                    <th>Username</th>
                </tr>
                </thead>
                <tbody id="customerDetailsTableBody">
                <!-- Filled dynamically -->
                </tbody>
            </table>
        </div>
    </section>
</main>

<script src="${pageContext.request.contextPath}/assets/controller/customer.js"></script>

<%@ include file="components/adminFooter.jsp" %>