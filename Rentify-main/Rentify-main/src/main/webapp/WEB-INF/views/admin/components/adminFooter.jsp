<%@ page contentType="text/html;charset=UTF-8" language="java" %>

            <footer class="admin-footer">
                <span class="text-muted">&copy; 2026 RENTIFY Admin Panel. All rights reserved.</span>
            </footer>

            </div><!-- /.admin-content -->
        </div><!-- /.admin-wrapper -->

<!-- Toast Container -->
<div class="position-fixed bottom-0 end-0 p-3" style="z-index: 9999;" id="toastContainer"></div>

<!-- Global Success Modal -->
<div class="modal fade" id="globalSuccessModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg text-center p-4">
            <div class="success-anim mb-3">
                <svg class="checkmark-svg" viewBox="0 0 52 52">
                    <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>
            <h5 class="fw-bold text-dark mb-1" id="successModalTitle">Success!</h5>
            <p class="text-muted mb-3" id="successModalMessage">Operation completed.</p>
            <button type="button" class="btn btn-primary py-2" data-bs-dismiss="modal">OK</button>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/assets/bootstrap/js/jquery-3.6.1.min.js"></script>
<script src="${pageContext.request.contextPath}/assets/bootstrap/js/bootstrap.bundle.js"></script>
<script src="${pageContext.request.contextPath}/assets/controller/url.js"></script>
<script src="${pageContext.request.contextPath}/assets/js/validation.js"></script>

<script>
// ===== GLOBAL LOADING SYSTEM =====
(function() {
    // Keep the show/hide functions available manually
    window.showGlobalLoader = function() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'flex';
            loader.classList.remove('loaded');
        }
    };
    
    window.hideGlobalLoader = function() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.add('loaded');
            setTimeout(() => loader.style.display = 'none', 500);
        }
    };
})();

// ===== TOAST SYSTEM =====
window.showToast = function(message, type) {
    type = type || 'success';
    let icon = type === 'success' ? 'check-circle' : (type === 'danger' ? 'exclamation-circle' : 'info-circle');
    let bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-info');
    let toastHtml =
        '<div class="toast align-items-center text-white ' + bgClass + ' border-0 mb-2" role="alert">' +
        '<div class="d-flex">' +
        '<div class="toast-body"><i class="fas fa-' + icon + ' me-2"></i>' + message + '</div>' +
        '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>' +
        '</div></div>';
    let container = document.getElementById('toastContainer');
    container.insertAdjacentHTML('beforeend', toastHtml);
    let toastEl = container.lastElementChild;
    new bootstrap.Toast(toastEl, { delay: 4000 }).show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
};

window.showSuccessModal = function(title, message, callback) {
    document.getElementById('successModalTitle').textContent = title || 'Success!';
    document.getElementById('successModalMessage').textContent = message || 'Operation completed.';
    let modal = new bootstrap.Modal(document.getElementById('globalSuccessModal'));
    modal.show();
    if (callback) {
        document.getElementById('globalSuccessModal').addEventListener('hidden.bs.modal', callback, { once: true });
    }
};

// Sidebar logic
(function() {
    const sidebar   = document.getElementById('adminSidebar');
    const overlay   = document.getElementById('sidebarOverlay');
    const toggle    = document.getElementById('sidebarToggle');
    const body      = document.body;
    const MOBILE_BP = 992;

    function isMobile() {
        return window.innerWidth < MOBILE_BP;
    }

    if (toggle) {
        toggle.addEventListener('click', function() {
            if (isMobile()) {
                sidebar.classList.toggle('mobile-open');
                overlay.classList.toggle('show');
            } else {
                body.classList.toggle('sidebar-collapsed');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('show');
        });
    }

    window.addEventListener('resize', function() {
        if (!isMobile()) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('show');
        }
    });

    (function highlightActiveNav() {
        var currentPath = window.location.pathname;
        var links = document.querySelectorAll('.sidebar-nav .nav-link');
        links.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href && currentPath.indexOf(href) !== -1) {
                link.classList.add('active');
            }
        });

        if (!document.querySelector('.sidebar-nav .nav-link.active')) {
            var segments = currentPath.split('/');
            var lastSeg = segments[segments.length - 1] || segments[segments.length - 2];
            links.forEach(function(link) {
                var href = link.getAttribute('href');
                if (href && href.indexOf('/' + lastSeg) !== -1) {
                    link.classList.add('active');
                }
            });
        }
    })();
})();
</script>

<style>
    /* ===== Full-Page Loader ===== */
    .global-loader {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255,255,255,0.95);
        display: flex; align-items: center; justify-content: center;
        z-index: 99999;
        transition: opacity 0.4s ease, visibility 0.4s ease;
    }
    .global-loader.loaded { opacity: 0; visibility: hidden; }
    .loader-content { text-align: center; }
    .car-loader { position: relative; width: 120px; margin: 0 auto 15px; }
    .loader-car { font-size: 36px; color: #667eea; animation: carDrive 1.2s ease-in-out infinite; }
    .loader-road { width: 100%; height: 3px; background: #e0e0e0; border-radius: 2px; margin-top: 4px; position: relative; overflow: hidden; }
    .loader-road::after { content: ''; position: absolute; top: 0; left: -40%; width: 40%; height: 100%; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 2px; animation: roadPulse 1.2s ease-in-out infinite; }
    .loader-text { color: #999; font-size: 14px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; animation: textPulse 1.5s ease-in-out infinite; }
    @keyframes carDrive { 0%,100% { transform: translateX(-8px) rotate(-1deg); } 50% { transform: translateX(8px) rotate(1deg); } }
    @keyframes roadPulse { 0% { left: -40%; } 100% { left: 100%; } }
    @keyframes textPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
    /* Success Checkmark */
    .success-anim { width: 70px; height: 70px; margin: 0 auto; }
    .checkmark-svg { width: 70px; height: 70px; border-radius: 50%; display: block; stroke-width: 2; stroke: #4CAF50; stroke-miterlimit: 10; animation: fillGreen 0.4s ease-in-out 0.4s forwards, scaleIn 0.3s ease-in-out 0.9s both; }
    .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4CAF50; fill: none; animation: strokeAnim 0.6s cubic-bezier(0.65,0,0.45,1) forwards; }
    .checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: strokeAnim 0.3s cubic-bezier(0.65,0,0.45,1) 0.8s forwards; }
    @keyframes strokeAnim { 100% { stroke-dashoffset: 0; } }
    @keyframes fillGreen { 100% { box-shadow: inset 0 0 0 30px rgba(76,175,80,0.1); } }
    @keyframes scaleIn { 0%,100% { transform: none; } 50% { transform: scale3d(1.1,1.1,1); } }
</style>

</body>
</html>
