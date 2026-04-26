<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <%@ include file="components/header.jsp" %>

        <main>
            <!-- HERO SECTION -->
            <section class="hero-section position-relative d-flex align-items-center"
                style="background: url('${pageContext.request.contextPath}/assets/img/mainCar.webp') no-repeat center center/cover; height: 75vh; margin-top: 76px;">
                <div class="overlay"
                    style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.3));">
                </div>

                <div class="container position-relative text-white">
                    <div class="row">
                        <div class="col-lg-8">
                            <span class="badge bg-primary mb-3 px-3 py-2 rounded-pill fw-bold">AFFORDABLE CAR RENTAL</span>
                            <h1 class="display-3 fw-bold mb-4">Drive Your Dream Car Today</h1>
                            <p class="lead mb-4 text-white-50">Experience the ultimate freedom with our luxury fleet. No
                                paperwork, just drive.</p>
                            <div class="d-flex gap-3">
                                <a href="${pageContext.request.contextPath}/vehicles"
                                    class="btn btn-primary-custom btn-lg px-5">Book Now</a>
                                <a href="${pageContext.request.contextPath}/about" class="btn btn-outline-light btn-lg px-5">Learn More</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- QUICK BOOK WIDGET (Moved Below Hero) -->
            <section class="position-relative" style="margin-top: -50px; z-index: 10;">
                <div class="container">
                    <div class="glass-panel p-4 rounded-3 text-dark shadow-lg bg-white">
                        <form action="${pageContext.request.contextPath}/vehicles" method="get">
                            <div class="row g-3 align-items-end">
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold"><i
                                            class="fas fa-map-marker-alt text-primary me-2"></i>LOCATION</label>
                                    <select class="form-select border-0 bg-light p-3" name="location">
                                        <option value="Colombo" selected>Rajkot</option>
                                        <option value="Galle">Ahmedabad</option>
                                        <option value="Kandy">Surat</option>
                                        <option value="Negombo">Vadodara</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold"><i
                                            class="fas fa-calendar-alt text-primary me-2"></i>PICK-UP</label>
                                    <input type="date" class="form-control border-0 bg-light p-3">
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-muted small fw-bold"><i
                                            class="fas fa-calendar-check text-primary me-2"></i>DROP-OFF</label>
                                    <input type="date" class="form-control border-0 bg-light p-3">
                                </div>
                                <div class="col-md-3">
                                    <button type="submit" class="btn btn-primary-custom w-100 h-100 py-3 fw-bold">FIND
                                        VEHICLE</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <!-- SERVICES SECTION -->
            <section id="services" class="py-5 bg-white mb-5 mt-5">
                <div class="container py-5">
                    <div class="text-center mb-5">
                        <h6 class="text-primary fw-bold text-uppercase">Why Choose Us</h6>
                        <h2 class="display-6 fw-bold">Our Premium Services</h2>
                    </div>

                    <div class="row g-3">
                        <!-- ... other services (kept concise for brevity but structure remains) ... -->
                        <div class="col-md-3">
                            <div class="card card-modern h-100 p-4 text-center border-0 bg-light">
                                <div class="mb-4 text-primary">
                                    <i class="fas fa-map-marked-alt fa-3x"></i>
                                </div>
                                <h5 class="fw-bold">GPS Navigation</h5>
                                <p class="text-muted small">All cars equipped with latest GPS systems.</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-modern h-100 p-4 text-center border-0 bg-light">
                                <div class="mb-4 text-primary">
                                    <i class="fas fa-gas-pump fa-3x"></i>
                                </div>
                                <h5 class="fw-bold">Full Tank Info</h5>
                                <p class="text-muted small">Transparent fuel policies and options.</p>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card card-modern h-100 p-4 text-center border-0 bg-light">
                                <div class="mb-4 text-primary">
                                    <i class="fas fa-headset fa-3x"></i>
                                </div>
                                <h5 class="fw-bold">24/7 Support</h5>
                                <p class="text-muted small">We are here to help you anytime, anywhere.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- FEATURED VEHICLES -->
            <section class="py-5 bg-light">
                <div class="container py-5">
                    <div class="d-flex justify-content-between align-items-end mb-5">
                        <div>
                            <h6 class="text-primary fw-bold text-uppercase">Our Fleet</h6>
                            <h2 class="display-6 fw-bold">Featured Vehicles</h2>
                        </div>
                        <a href="${pageContext.request.contextPath}/vehicles"
                            class="btn btn-outline-primary rounded-pill px-4">View All Cars <i
                                class="fas fa-arrow-right ms-2"></i></a>
                    </div>

                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card card-modern h-100 border-0">
                                <img src="${pageContext.request.contextPath}/assets/img/toyota_corolla.webp"
                                    class="card-img-top" alt="Toyota Corolla">
                                <div class="card-body p-4">
                                    <div class="d-flex justify-content-between mb-2">
                                        <h5 class="card-title fw-bold">Toyota Corolla</h5>
                                        <span class="badge bg-light text-dark border">Sedan</span>
                                    </div>
                                    <p class="text-muted small mb-3"><i class="fas fa-gas-pump me-2"></i>Petrol &bull;
                                        <i class="fas fa-cog mx-2"></i>Auto</p>
                                    <div class="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <span class="h5 fw-bold text-primary">Rs. 5,000</span>
                                            <span class="text-muted small">/day</span>
                                        </div>
                                        <a href="${pageContext.request.contextPath}/car_info?id=1"
                                            class="btn btn-sm btn-primary-custom px-4 rounded-pill">Rent Now</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- ... other cars ... -->
                        <div class="col-md-4">
                            <div class="card card-modern h-100 border-0">
                                <img src="${pageContext.request.contextPath}/assets/img/honda_civic.webp"
                                    class="card-img-top" alt="Honda Civic">
                                <div class="card-body p-4">
                                    <div class="d-flex justify-content-between mb-2">
                                        <h5 class="card-title fw-bold">Honda Civic</h5>
                                        <span class="badge bg-light text-dark border">Sedan</span>
                                    </div>
                                    <p class="text-muted small mb-3"><i class="fas fa-gas-pump me-2"></i>Petrol &bull;
                                        <i class="fas fa-cog mx-2"></i>Auto</p>
                                    <div class="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <span class="h5 fw-bold text-primary">Rs. 6,500</span>
                                            <span class="text-muted small">/day</span>
                                        </div>
                                        <a href="${pageContext.request.contextPath}/car_info?id=2"
                                            class="btn btn-sm btn-primary-custom px-4 rounded-pill">Rent Now</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card card-modern h-100 border-0">
                                <img src="${pageContext.request.contextPath}/assets/img/nissan_x_trail.webp"
                                    class="card-img-top" alt="Nissan X-Trail">
                                <div class="card-body p-4">
                                    <div class="d-flex justify-content-between mb-2">
                                        <h5 class="card-title fw-bold">Nissan X-Trail</h5>
                                        <span class="badge bg-light text-dark border">SUV</span>
                                    </div>
                                    <p class="text-muted small mb-3"><i class="fas fa-gas-pump me-2"></i>Diesel &bull;
                                        <i class="fas fa-cog mx-2"></i>Auto</p>
                                    <div class="d-flex justify-content-between align-items-center mt-3">
                                        <div>
                                            <span class="h5 fw-bold text-primary">Rs. 8,000</span>
                                            <span class="text-muted small">/day</span>
                                        </div>
                                        <a href="${pageContext.request.contextPath}/car_info?id=3"
                                            class="btn btn-sm btn-primary-custom px-4 rounded-pill">Rent Now</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <%@ include file="components/footer.jsp" %>