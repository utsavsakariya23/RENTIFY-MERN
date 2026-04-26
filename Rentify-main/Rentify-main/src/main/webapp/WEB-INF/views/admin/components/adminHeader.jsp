<%@ page contentType="text/html;charset=UTF-8" language="java" %>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin - RENTIFY</title>

        <link rel="icon" href="${pageContext.request.contextPath}/assets/img/icon.png" type="image/x-icon">

        <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/bootstrap/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/modern-global.css">
        <link rel="stylesheet" href="${pageContext.request.contextPath}/assets/css/admin-sidebar.css">
    </head>

    <body class="bg-light">

        <!-- Global Loading Overlay -->
        <div id="globalLoader" class="global-loader" style="display: none;">
            <div class="loader-content">
                <div class="car-loader">
                    <i class="fas fa-car-side loader-car"></i>
                    <div class="loader-road"></div>
                </div>
                <p class="loader-text">Loading...</p>
            </div>
        </div>

        <!-- Sidebar Overlay (mobile) -->
        <div class="sidebar-overlay" id="sidebarOverlay"></div>

        <div class="admin-wrapper">

            <!-- ========== SIDEBAR ========== -->
            <%@ include file="adminSidebar.jsp" %>

            <!-- ========== TOP BAR ========== -->
            <header class="admin-topbar">
                <button class="topbar-toggle" id="sidebarToggle" title="Toggle Sidebar">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="topbar-right">
                    <a href="${pageContext.request.contextPath}/admin/profile" class="admin-avatar">
                        <i class="fas fa-user-circle fa-lg"></i>
                        <span class="d-none d-sm-inline">Admin</span>
                    </a>
                </div>
            </header>

            <!-- ========== MAIN CONTENT AREA ========== -->
            <div class="admin-content">