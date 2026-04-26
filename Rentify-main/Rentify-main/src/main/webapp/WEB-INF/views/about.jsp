<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <%@ include file="components/header.jsp" %>

        <main>
            <!-- Hero Section -->
            <section class="position-relative py-5 theme-bg text-white"
                style="background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); margin-top: -20px;">
                <div class="container py-5 text-center">
                    <h1 class="display-4 fw-bold mb-3">About Easy Rental</h1>
                    <p class="lead mb-0 opacity-75">Redefining mobility with premium vehicles and exceptional service
                        since 2020.</p>
                </div>
            </section>

            <!-- Mission & Vision -->
            <section class="py-5">
                <div class="container py-4">
                    <div class="row g-5 align-items-center">
                        <div class="col-lg-6">
                            <img src="${pageContext.request.contextPath}/assets/img/mainCar.webp"
                                class="img-fluid rounded-3 shadow-lg" alt="About Us">
                        </div>
                        <div class="col-lg-6">
                            <h6 class="text-primary fw-bold text-uppercase">Who We Are</h6>
                            <h2 class="fw-bold mb-4">Driving Your Dreams Forward</h2>
                            <p class="text-muted mb-4">
                                At Easy Rental, we believe that the journey is just as important as the destination.
                                We started with a simple mission: to make car rental effortless, transparent, and
                                enjoyable.
                            </p>
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <div class="d-flex">
                                        <i class="fas fa-check-circle text-primary fa-2x me-3"></i>
                                        <div>
                                            <h6 class="fw-bold">Reliable Fleet</h6>
                                            <p class="small text-muted">Rigorous maintenance checks for your safety.</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="d-flex">
                                        <i class="fas fa-star text-primary fa-2x me-3"></i>
                                        <div>
                                            <h6 class="fw-bold">Top Rated</h6>
                                            <p class="small text-muted">Consistently rated 4.9/5 by our customers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Stats -->
            <section class="py-5 bg-light">
                <div class="container">
                    <div class="row g-4 text-center">
                        <div class="col-md-3">
                            <h2 class="fw-bold text-primary">500+</h2>
                            <p class="text-muted">Premium Vehicles</p>
                        </div>
                        <div class="col-md-3">
                            <h2 class="fw-bold text-primary">10k+</h2>
                            <p class="text-muted">Happy Customers</p>
                        </div>
                        <div class="col-md-3">
                            <h2 class="fw-bold text-primary">50+</h2>
                            <p class="text-muted">Locations</p>
                        </div>
                        <div class="col-md-3">
                            <h2 class="fw-bold text-primary">24/7</h2>
                            <p class="text-muted">Customer Support</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Team / Vision -->
            <section class="py-5 mb-5">
                <div class="container">
                    <div class="text-center mb-5">
                        <h6 class="text-primary fw-bold text-uppercase">Our Vision</h6>
                        <h2 class="fw-bold">The Future of Mobility</h2>
                        <p class="text-muted w-75 mx-auto">
                            We are constantly innovating to bring you the best travel experience. From electric vehicles
                            to seamless
                            app-based bookings, we are building the future of car rental.
                        </p>
                    </div>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card card-modern border-0 text-center p-4 h-100">
                                <i class="fas fa-leaf fa-3x text-success mb-3"></i>
                                <h5 class="fw-bold">Eco-Friendly</h5>
                                <p class="text-muted small">Expanding our fleet with hybrid and electric vehicles to
                                    reduce carbon footprint.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card card-modern border-0 text-center p-4 h-100">
                                <i class="fas fa-mobile-alt fa-3x text-primary mb-3"></i>
                                <h5 class="fw-bold">Digital First</h5>
                                <p class="text-muted small">A completely paperless, digital booking experience for your
                                    convenience.</p>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card card-modern border-0 text-center p-4 h-100">
                                <i class="fas fa-globe fa-3x text-info mb-3"></i>
                                <h5 class="fw-bold">National Reach</h5>
                                <p class="text-muted small">Growing our network to serve you in more cities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <%@ include file="components/footer.jsp" %>