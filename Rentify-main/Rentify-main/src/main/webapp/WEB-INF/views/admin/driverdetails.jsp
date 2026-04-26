<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container my-5">
    <section>
        <div class="container">
            <form id="driverForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group mb-3">
                            <label for="nicNumber" class="fw-bold">NIC Number</label>
                            <input type="text" class="form-control" id="nicNumber" name="nicNUmber"
                                   placeholder="Enter NIC number" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="licenceNo" class="fw-bold">Licence Card Number</label>
                            <input type="text" class="form-control" id="licenceNo" name="licenceNo"
                                   placeholder="Enter licence card number" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="attendName" class="fw-bold">Name</label>
                            <input type="text" class="form-control" id="attendName" name="attendName"
                                   placeholder="Enter name" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="address" class="fw-bold">Address</label>
                            <input type="text" class="form-control" id="address" name="address"
                                   placeholder="Enter address" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="DriverAvailability" class="fw-bold">Availability</label>
                            <input type="text" class="form-control" id="DriverAvailability" name="availability"
                                   placeholder="Availability" readonly>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div id="disableForDriver">
                            <div class="form-group mb-3">
                                <label for="phoneNumber" class="fw-bold">Phone Number</label>
                                <input type="tel" class="form-control" id="phoneNumber" name="number"
                                       placeholder="Enter phone number" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="email" class="fw-bold">Email</label>
                                <input type="email" class="form-control" id="email" name="email"
                                       placeholder="Enter email" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="username" class="fw-bold">Username</label>
                                <input type="text" class="form-control" id="username" name="username"
                                       placeholder="Choose a username" required>
                            </div>
                            <div class="form-group mb-3">
                                <label for="password" class="fw-bold">Password</label>
                                <input type="password" class="form-control" id="password" name="password"
                                       placeholder="Choose a password" required>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button" class="btn btn-primary fw-bold" id="driverSave">Save</button>
                <button type="button" class="btn btn-danger fw-bold" id="driverDelete">Delete</button>
                <button type="button" class="btn btn-secondary fw-bold" id="driverUpdate">Update</button>
            </form>
        </div>
    </section>

    <section id="driverTable" class="mt-4">
        <div class="container">
            <h3>Driver Schedule</h3><br>
            <table class="table table-bordered">
                <thead>
                <tr>
                    <th>Rent ID</th>
                    <th>Car ID</th>
                    <th>Driver ID</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                <!-- Filled dynamically -->
                </tbody>
            </table>
        </div>
    </section>
</main>

<script src="${pageContext.request.contextPath}/assets/controller/driver.js"></script>

<%@ include file="components/adminFooter.jsp" %>