<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="components/adminHeader.jsp" %>

<main class="container my-5">
    <section>
        <div class="container" id="vehicleForm">
            <form>
                <div class="row">
                    <div class="col-md-4">
                        <div class="form-group mb-3">
                            <label for="regNum" class="fw-bold">Register Number</label><br>
                            <input type="text" class="form-control-file border border-dark rounded"
                                   name="number" id="regNum" required>
                        </div>
                        <div class="form-group mb-3 fw-bold">
                            <label for="brand" class="fw-bold">Brand</label>
                            <input type="text" class="form-control" id="brand" name="brand"
                                   placeholder="Brand" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="type" class="fw-bold">Rates</label>
                            <select class="form-control" name="type" id="type" required>
                                <option value="General">general</option>
                                <option value="Premium">premium</option>
                                <option value="Luxury">Luxury</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label for="frontView" class="fw-bold">Front view</label><br>
                            <input type="file" class="form-control-file border border-dark rounded"
                                   name="imgFront" id="frontView" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="backView" class="fw-bold">Back view</label><br>
                            <input type="file" class="form-control-file border border-dark rounded"
                                   id="backView" name="imgBack" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="loosDamageViewer" class="fw-bold">Free Mileage</label>
                            <input type="text" class="form-control" id="loosDamageViewer" name="damage"
                                   placeholder="No Of Passenger" required>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="form-group mb-3">
                            <label for="sideView" class="fw-bold">Side view</label><br>
                            <input type="file" class="form-control-file border border-dark rounded"
                                   name="imgSide" id="sideView" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="interior" class="fw-bold">Interior</label><br>
                            <input type="file" class="form-control-file border border-dark rounded"
                                   name="imgInside" id="interior" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="nuOfPassenger" class="fw-bold">Number of passengers</label>
                            <input type="text" class="form-control" id="nuOfPassenger" name="passenger"
                                   placeholder="No Of Passenger" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="transmission" class="fw-bold">Type</label>
                            <select class="form-control" name="transmission" id="transmission" required>
                                <option value="Manual">Manual</option>
                                <option value="Auto">Auto</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label for="dailyRate" class="fw-bold">Daily Rate</label>
                            <input type="tel" class="form-control" name="dalyRate" id="dailyRate"
                                   placeholder="Daily Rate" required>
                        </div>

                    </div>

                    <div class="col-md-4">
                        <div class="form-group mb-3">
                            <label for="monthlyRate" class="fw-bold">Monthly rate</label><br>
                            <input type="text" class="form-control-file border border-dark rounded"
                                   name="monthlyRate" id="monthlyRate" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="priceForExtraKM" class="fw-bold">Price for extra KM</label><br>
                            <input type="text" class="form-control-file border border-dark rounded"
                                   name="extraKM" id="priceForExtraKM" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="freeMileage" class="fw-bold">Free Mileage</label>
                            <input type="text" class="form-control" name="freeMilage" id="freeMileage"
                                   placeholder="No Of Passenger" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="color" class="fw-bold">Color</label>
                            <input type="tel" class="form-control" id="color" name="color"
                                   placeholder="Color" required>
                        </div>
                        <div class="form-group mb-3">
                            <label for="fuelType" class="fw-bold">Vehicle Availability Type</label>
                            <select class="form-control" id="fuelType" name="fuel" required>
                                <option value="Petrol">Petrol</option>
                                <option value="Diesel">Diesel</option>
                            </select>
                        </div>

                    </div>
                </div>

                <div id="buttonsVehi" class="d-inline-block">
                    <button type="button" class="btn btn-primary fw-bold" id="saveCar">Save</button>
                    <button type="button" class="btn btn-secondary fw-bold" id="update">Update</button>
                    <button type="button" class="btn btn-danger fw-bold" id="delete">Delete</button>
                </div>

            </form>
        </div>

    </section>

    <!-- Vehicle list table -->
    <section class="mt-5">
        <div class="container">
            <h2>Vehicle List</h2>
            <table class="table table-bordered" id="vehicleTable">
                <thead>
                <tr>
                    <th>Register No</th>
                    <th>Brand</th>
                    <th>Type</th>
                    <th>Passengers</th>
                    <th>Daily Rate</th>
                    <th>Monthly Rate</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                <!-- To be filled by backend / JS later -->
                </tbody>
            </table>
        </div>
    </section>
</main>

<script src="${pageContext.request.contextPath}/assets/controller/car.js"></script>

<%@ include file="components/adminFooter.jsp" %>