<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <%@ include file="components/header.jsp" %>

        <main class="d-flex align-items-center" style="min-height: 80vh; padding-top: 80px; background-color: #f8f9fa;">
            <div class="container my-5">
                <div class="row justify-content-center">
                    <div class="col-lg-7">
                        <div class="card card-modern border-0 p-5 shadow-lg">
                            <div class="text-center mb-5">
                                <h3 class="fw-bold text-dark">Create Account</h3>
                                <p class="text-muted">Join us today and start your journey</p>
                            </div>

                            <!-- Alert container for AJAX messages -->
                            <div id="registerAlert" style="display: none;"></div>

                            <!-- Step Indicator -->
                            <div class="d-flex justify-content-center mb-4">
                                <div class="step-indicator d-flex align-items-center gap-2">
                                    <div class="step-badge active" id="stepBadge1">
                                        <span>1</span>
                                    </div>
                                    <div class="step-line" id="stepLine1"></div>
                                    <div class="step-badge" id="stepBadge2">
                                        <span>2</span>
                                    </div>
                                    <div class="step-line" id="stepLine2"></div>
                                    <div class="step-badge" id="stepBadge3">
                                        <span>3</span>
                                    </div>
                                </div>
                            </div>

                            <form id="registerForm" novalidate>
                                <!-- ===== STEP 1: Email + OTP ===== -->
                                <div id="step1" class="register-step">
                                    <h6 class="text-primary fw-bold text-uppercase mb-3">
                                        <i class="fas fa-envelope me-2"></i>Email Verification
                                    </h6>

                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">EMAIL ADDRESS</label>
                                        <div class="input-group">
                                            <input type="email" class="form-control bg-light border-0" name="email" id="regEmail"
                                                placeholder="Enter your email" required>
                                            <button type="button" class="btn btn-primary" id="sendOtpBtn" onclick="sendOTP()">
                                                <i class="fas fa-paper-plane me-1"></i>Send OTP
                                            </button>
                                        </div>
                                        <div id="emailFeedback" class="mt-1"></div>
                                    </div>

                                    <div id="otpSection" style="display: none;">
                                        <div class="mb-3">
                                            <label class="form-label small fw-bold">ENTER 6-DIGIT OTP</label>
                                            <div class="otp-input-group d-flex gap-2 justify-content-center">
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="0" autofocus>
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="1">
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="2">
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="3">
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="4">
                                                <input type="text" class="form-control otp-digit text-center fw-bold fs-4" maxlength="1" data-index="5">
                                            </div>
                                            <input type="hidden" name="otp" id="otpValue">
                                            <div id="otpFeedback" class="mt-2 text-center"></div>
                                        </div>

                                        <div class="d-flex justify-content-between align-items-center mb-3">
                                            <small class="text-muted" id="otpTimer">Code expires in <span id="timerCount">5:00</span></small>
                                            <button type="button" class="btn btn-link btn-sm text-decoration-none p-0" id="resendBtn" onclick="sendOTP()" disabled>
                                                Resend OTP
                                            </button>
                                        </div>

                                        <button type="button" class="btn btn-primary-custom w-100 py-2 fw-bold" id="verifyOtpBtn" onclick="verifyOTP()">
                                            <i class="fas fa-shield-alt me-2"></i>Verify Email
                                        </button>
                                    </div>

                                    <!-- Verified badge (shown after successful OTP) -->
                                    <div id="emailVerified" style="display: none;" class="text-center py-3">
                                        <div class="d-inline-flex align-items-center px-4 py-2 rounded-pill bg-success bg-opacity-10">
                                            <i class="fas fa-check-circle text-success fs-4 me-2"></i>
                                            <span class="text-success fw-bold">Email Verified Successfully!</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- ===== STEP 2: Personal Details ===== -->
                                <div id="step2" class="register-step" style="display: none;">
                                    <h6 class="text-primary fw-bold text-uppercase mb-3">
                                        <i class="fas fa-user me-2"></i>Personal Details
                                    </h6>

                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">FULL NAME</label>
                                        <input type="text" class="form-control bg-light border-0" name="fullName" id="regFullName"
                                            placeholder="Enter your full name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">PHONE NUMBER</label>
                                        <input type="tel" class="form-control bg-light border-0" name="phone" id="regPhone"
                                            placeholder="Enter your phone number" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">LICENSE NUMBER</label>
                                        <input type="text" class="form-control bg-light border-0" name="licenseNo" id="regLicense"
                                            placeholder="Driving License Number" required>
                                    </div>

                                    <div class="d-flex gap-3">
                                        <button type="button" class="btn btn-outline-secondary flex-fill py-2" onclick="goToStep(1)">
                                            <i class="fas fa-arrow-left me-1"></i>Back
                                        </button>
                                        <button type="button" class="btn btn-primary-custom flex-fill py-2 fw-bold" onclick="goToStep(3)">
                                            Continue<i class="fas fa-arrow-right ms-1"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- ===== STEP 3: Account Setup ===== -->
                                <div id="step3" class="register-step" style="display: none;">
                                    <h6 class="text-primary fw-bold text-uppercase mb-3">
                                        <i class="fas fa-lock me-2"></i>Account Setup
                                    </h6>

                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">USERNAME</label>
                                        <input type="text" class="form-control bg-light border-0" name="username" id="regUsername"
                                            placeholder="Choose a username" required>
                                        <div id="usernameFeedback" class="mt-1"></div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">PASSWORD</label>
                                        <input type="password" class="form-control bg-light border-0" name="password" id="regPassword"
                                            placeholder="Create password (min 8 chars)" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label small fw-bold">CONFIRM PASSWORD</label>
                                        <input type="password" class="form-control bg-light border-0" name="confirmPassword" id="regConfirmPassword"
                                            placeholder="Confirm your password" required>
                                        <div id="passwordFeedback" class="mt-1"></div>
                                    </div>

                                    <div class="d-flex gap-3">
                                        <button type="button" class="btn btn-outline-secondary flex-fill py-2" onclick="goToStep(2)">
                                            <i class="fas fa-arrow-left me-1"></i>Back
                                        </button>
                                        <button type="button" class="btn btn-primary-custom flex-fill py-2 fw-bold" id="submitRegBtn" onclick="submitRegistration()">
                                            <i class="fas fa-user-plus me-2"></i>Create Account
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <div class="text-center mt-4">
                                <span class="text-muted small">Already have an account?</span>
                                <a href="${pageContext.request.contextPath}/login"
                                    class="fw-bold text-decoration-none ms-1">Login Here</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Success Modal -->
        <div class="modal fade" id="registerSuccessModal" tabindex="-1" data-bs-backdrop="static">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg p-4 text-center">
                    <div class="success-checkmark mb-3">
                        <div class="check-icon">
                            <span class="icon-line line-tip"></span>
                            <span class="icon-line line-long"></span>
                            <div class="icon-circle"></div>
                            <div class="icon-fix"></div>
                        </div>
                    </div>
                    <h4 class="fw-bold text-success mb-2">Registration Successful!</h4>
                    <p class="text-muted mb-4">Your account has been created. You can now login with your credentials.</p>
                    <a href="${pageContext.request.contextPath}/login" class="btn btn-primary-custom py-2 fw-bold">
                        <i class="fas fa-sign-in-alt me-2"></i>Go to Login
                    </a>
                </div>
            </div>
        </div>

        <style>
            /* Step Indicator */
            .step-badge {
                width: 40px; height: 40px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                background: #e9ecef; color: #999; font-weight: bold;
                transition: all 0.3s ease;
            }
            .step-badge.active { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
            .step-badge.completed { background: #28a745; color: white; }
            .step-line { width: 60px; height: 3px; background: #e9ecef; border-radius: 2px; transition: background 0.3s; }
            .step-line.active { background: linear-gradient(135deg, #667eea, #764ba2); }

            /* OTP Input */
            .otp-digit {
                width: 50px !important; height: 55px;
                border: 2px solid #e0e0e0 !important; border-radius: 10px !important;
                font-family: monospace; transition: all 0.2s ease;
            }
            .otp-digit:focus { border-color: #667eea !important; box-shadow: 0 0 0 3px rgba(102,126,234,0.15) !important; }
            .otp-digit.filled { border-color: #667eea !important; background: #f0f4ff !important; }

            /* Step transitions */
            .register-step { animation: fadeInUp 0.4s ease; }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(15px); }
                to { opacity: 1; transform: translateY(0); }
            }

            /* Success Checkmark Animation */
            .success-checkmark { width: 80px; height: 80px; margin: 0 auto; }
            .check-icon { width: 80px; height: 80px; position: relative; border-radius: 50%; box-sizing: content-box; border: 4px solid #4CAF50; }
            .check-icon::before { top: 3px; left: -2px; width: 30px; height: 90px; border-radius: 100px 0 0 100px; position: absolute; content: ''; background: white; transform: rotate(-45deg); transform-origin: 30px 60px; }
            .check-icon::after { top: 0; left: 30px; width: 60px; height: 90px; position: absolute; content: ''; border-radius: 0 100px 100px 0; background: white; transform: rotate(-45deg); transform-origin: 0 60px; animation: rotateAfter 4.25s ease-in; }
            .icon-line { height: 5px; background-color: #4CAF50; display: block; border-radius: 2px; position: absolute; z-index: 10; }
            .line-tip { top: 46px; left: 14px; width: 25px; transform: rotate(45deg); animation: iconTip 0.75s; }
            .line-long { top: 38px; left: 28px; width: 47px; transform: rotate(-45deg); animation: iconLong 0.75s; }
            .icon-circle { top: -4px; left: -4px; z-index: 10; width: 80px; height: 80px; border-radius: 50%; position: absolute; box-sizing: content-box; border: 4px solid rgba(76,175,80,.5); }
            .icon-fix { top: 8px; width: 5px; left: 26px; z-index: 1; height: 85px; position: absolute; background-color: white; transform: rotate(-45deg); }
            @keyframes iconTip { 0%,54% { width: 0; left: 1px; top: 19px; } 54% { width: 0; left: 1px; top: 19px; } 70% { width: 50px; left: -8px; top: 37px; } 84% { width: 17px; left: 21px; top: 48px; } 100% { width: 25px; left: 14px; top: 46px; } }
            @keyframes iconLong { 0%,65% { width: 0; right: 46px; top: 54px; } 84% { width: 55px; right: 0; top: 35px; } 100% { width: 47px; right: 8px; top: 38px; } }
        </style>

        <script>
            const ctx = '${pageContext.request.contextPath}';
            let otpVerified = false;
            let otpTimerInterval = null;

            // ===== OTP Digit Box Logic =====
            document.querySelectorAll('.otp-digit').forEach((input, idx, inputs) => {
                input.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                    if (this.value.length === 1) {
                        this.classList.add('filled');
                        if (idx < inputs.length - 1) inputs[idx + 1].focus();
                    }
                    updateOTPValue();
                });
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && !this.value && idx > 0) {
                        inputs[idx - 1].focus();
                        inputs[idx - 1].value = '';
                        inputs[idx - 1].classList.remove('filled');
                    }
                });
                // Handle paste
                input.addEventListener('paste', function(e) {
                    e.preventDefault();
                    let data = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
                    for (let i = 0; i < Math.min(data.length, 6); i++) {
                        inputs[i].value = data[i];
                        inputs[i].classList.add('filled');
                    }
                    updateOTPValue();
                    if (data.length >= 6) inputs[5].focus();
                });
            });

            function updateOTPValue() {
                let otp = '';
                document.querySelectorAll('.otp-digit').forEach(d => otp += d.value);
                document.getElementById('otpValue').value = otp;
            }

            // ===== Step Navigation =====
            function goToStep(step) {
                // Validate before moving forward
                if (step === 2 && !otpVerified) {
                    showAlert('danger', 'Please verify your email first.');
                    return;
                }
                if (step === 3) {
                    let fn = document.getElementById('regFullName').value.trim();
                    let ph = document.getElementById('regPhone').value.trim();
                    if (!fn || !ph) {
                        showAlert('danger', 'Please fill in all fields.');
                        return;
                    }
                }

                document.querySelectorAll('.register-step').forEach(s => s.style.display = 'none');
                document.getElementById('step' + step).style.display = 'block';

                // Update step indicators
                for (let i = 1; i <= 3; i++) {
                    let badge = document.getElementById('stepBadge' + i);
                    badge.classList.remove('active', 'completed');
                    if (i < step) badge.classList.add('completed');
                    else if (i === step) badge.classList.add('active');
                }
                for (let i = 1; i <= 2; i++) {
                    let line = document.getElementById('stepLine' + i);
                    line.classList.toggle('active', i < step);
                }
                hideAlert();
            }

            // ===== Send OTP =====
            function sendOTP() {
                let email = document.getElementById('regEmail').value.trim();
                if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    showAlert('danger', 'Please enter a valid email address.');
                    return;
                }

                let btn = document.getElementById('sendOtpBtn');
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Sending...';

                fetch(ctx + '/send_otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'email=' + encodeURIComponent(email)
                })
                .then(r => r.json())
                .then(data => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Resend';
                    if (data.success) {
                        showAlert('success', data.message);
                        document.getElementById('otpSection').style.display = 'block';
                        document.getElementById('regEmail').readOnly = true;
                        startOTPTimer();
                        document.querySelector('.otp-digit').focus();
                    } else {
                        showAlert('danger', data.message);
                    }
                })
                .catch(err => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-paper-plane me-1"></i>Send OTP';
                    showAlert('danger', 'Network error. Please try again.');
                });
            }

            // ===== Verify OTP =====
            function verifyOTP() {
                let email = document.getElementById('regEmail').value.trim();
                let otp = document.getElementById('otpValue').value.trim();

                if (!otp || otp.length < 6) {
                    document.getElementById('otpFeedback').innerHTML =
                        '<small class="text-danger"><i class="fas fa-times-circle"></i> Please enter the complete 6-digit code.</small>';
                    return;
                }

                let btn = document.getElementById('verifyOtpBtn');
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Verifying...';

                fetch(ctx + '/verify_otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'email=' + encodeURIComponent(email) + '&otp=' + encodeURIComponent(otp)
                })
                .then(r => r.json())
                .then(data => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-shield-alt me-2"></i>Verify Email';
                    if (data.success) {
                        otpVerified = true;
                        clearInterval(otpTimerInterval);
                        document.getElementById('otpSection').style.display = 'none';
                        document.getElementById('emailVerified').style.display = 'block';
                        document.getElementById('sendOtpBtn').style.display = 'none';
                        hideAlert();
                        // Auto-advance to step 2 after 1 second
                        setTimeout(() => goToStep(2), 1000);
                    } else {
                        document.getElementById('otpFeedback').innerHTML =
                            '<small class="text-danger"><i class="fas fa-times-circle"></i> ' + data.message + '</small>';
                        // Shake animation on OTP inputs
                        document.querySelector('.otp-input-group').style.animation = 'shake 0.5s ease';
                        setTimeout(() => document.querySelector('.otp-input-group').style.animation = '', 500);
                    }
                })
                .catch(err => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-shield-alt me-2"></i>Verify Email';
                    showAlert('danger', 'Network error. Please try again.');
                });
            }

            // ===== Submit Registration =====
            function submitRegistration() {
                let username = document.getElementById('regUsername').value.trim();
                let password = document.getElementById('regPassword').value;
                let confirmPassword = document.getElementById('regConfirmPassword').value;

                if (!username || !password || !confirmPassword) {
                    showAlert('danger', 'Please fill in all account details.');
                    return;
                }
                if (password.length < 8) {
                    showAlert('danger', 'Password must be at least 8 characters.');
                    return;
                }
                if (password !== confirmPassword) {
                    document.getElementById('passwordFeedback').innerHTML =
                        '<small class="text-danger"><i class="fas fa-times-circle"></i> Passwords do not match.</small>';
                    return;
                }

                let btn = document.getElementById('submitRegBtn');
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Creating Account...';

                let formData = new URLSearchParams({
                    fullName: document.getElementById('regFullName').value.trim(),
                    email: document.getElementById('regEmail').value.trim(),
                    phone: document.getElementById('regPhone').value.trim(),
                    username: username,
                    password: password,
                    confirmPassword: confirmPassword,
                    licenseNo: document.getElementById('regLicense').value.trim()
                });

                fetch(ctx + '/perform_register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                })
                .then(r => r.json())
                .then(data => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
                    if (data.success) {
                        // Show success modal
                        new bootstrap.Modal(document.getElementById('registerSuccessModal')).show();
                    } else {
                        showAlert('danger', data.message);
                    }
                })
                .catch(err => {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Create Account';
                    showAlert('danger', 'Network error. Please try again.');
                });
            }

            // ===== OTP Timer =====
            function startOTPTimer() {
                let seconds = 300; // 5 minutes
                document.getElementById('resendBtn').disabled = true;
                clearInterval(otpTimerInterval);
                otpTimerInterval = setInterval(() => {
                    seconds--;
                    let m = Math.floor(seconds / 60);
                    let s = seconds % 60;
                    document.getElementById('timerCount').textContent = m + ':' + (s < 10 ? '0' : '') + s;
                    if (seconds <= 0) {
                        clearInterval(otpTimerInterval);
                        document.getElementById('timerCount').textContent = 'Expired';
                        document.getElementById('resendBtn').disabled = false;
                    }
                }, 1000);
            }

            // ===== Real-time username check =====
            let usernameTimer;
            document.getElementById('regUsername')?.addEventListener('input', function() {
                clearTimeout(usernameTimer);
                let val = this.value.trim();
                if (val.length < 3) return;
                usernameTimer = setTimeout(() => {
                    fetch(ctx + '/validate_unique', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'field=username&value=' + encodeURIComponent(val)
                    })
                    .then(r => r.json())
                    .then(data => {
                        let fb = document.getElementById('usernameFeedback');
                        if (data.taken) {
                            fb.innerHTML = '<small class="text-danger"><i class="fas fa-times-circle"></i> Username already taken.</small>';
                        } else {
                            fb.innerHTML = '<small class="text-success"><i class="fas fa-check-circle"></i> Username available!</small>';
                        }
                    });
                }, 400);
            });

            // ===== Utils =====
            function showAlert(type, msg) {
                let el = document.getElementById('registerAlert');
                el.style.display = 'block';
                el.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show"><i class="fas fa-' +
                    (type === 'success' ? 'check-circle' : 'exclamation-circle') + ' me-2"></i>' + msg +
                    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
            }
            function hideAlert() {
                document.getElementById('registerAlert').style.display = 'none';
            }
        </script>

        <style>
            @keyframes shake {
                0%,100% { transform: translateX(0); }
                20%,60% { transform: translateX(-8px); }
                40%,80% { transform: translateX(8px); }
            }
        </style>

    <%@ include file="components/footer.jsp" %>