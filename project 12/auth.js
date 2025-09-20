// ============= Authentication Utility Library =============
// يمكن استخدام هذا الملف في جميع صفحات المشروع

const AUTH_CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  TEMP_TOKEN_KEY: 'tempToken',
  USER_EMAIL_KEY: 'userEmail',
  RESET_TOKEN_KEY: 'resetToken'
};

// ============= Core Authentication Functions =============

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Get user data from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function isLoggedIn() {
  return getAuthToken() && getCurrentUser();
}

// Save user session
function saveUserSession(token, user) {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
}

// Clear user session
function clearUserSession() {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
  localStorage.removeItem(AUTH_CONFIG.TEMP_TOKEN_KEY);
  localStorage.removeItem(AUTH_CONFIG.USER_EMAIL_KEY);
  localStorage.removeItem(AUTH_CONFIG.RESET_TOKEN_KEY);
}

// ============= API Request Functions =============

// Create protected API request
async function protectedRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) {
    handleAuthError('لا يوجد رمز مصادقة');
    return null;
  }
  
  const url = `${AUTH_CONFIG.API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      handleAuthError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
      return null;
    }
    
    if (response.status === 403) {
      const result = await response.json();
      if (result.requiresVerification) {
        handleVerificationRequired(getCurrentUser()?.email);
        return null;
      }
    }
    
    return response;
  } catch (error) {
    console.error('API Request Error:', error);
    if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
      showNotification('خطأ في الاتصال. تحقق من اتصالك بالإنترنت', 'error');
    }
    return null;
  }
}

// Handle authentication errors
function handleAuthError(message) {
  clearUserSession();
  showNotification(message, 'error');
  redirectToLogin();
}

// Handle verification required
function handleVerificationRequired(email) {
  if (email) {
    localStorage.setItem(AUTH_CONFIG.USER_EMAIL_KEY, email);
  }
  showNotification('يجب تفعيل حسابك أولاً', 'warning');
  // Redirect to OTP page or show OTP modal
}

// Redirect to login (for pages that don't have modals)
function redirectToLogin() {
  if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    window.location.href = 'index.html';
  }
}

// ============= User Role & Permission Functions =============

// Check if user has specific role
function hasRole(role) {
  const user = getCurrentUser();
  return user && user.role === role;
}

// Check if user is student
function isStudent() {
  return hasRole('student');
}

// Check if user is instructor
function isInstructor() {
  return hasRole('instructor');
}

// Check if user is admin
function isAdmin() {
  return hasRole('admin');
}

// Check if user has instructor or admin privileges
function hasInstructorPrivileges() {
  return isInstructor() || isAdmin();
}

// Check if user has access to specific grade
function hasGradeAccess(targetGrade) {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Instructors and admins can access all grades
  if (hasInstructorPrivileges()) {
    return true;
  }
  
  // Students can only access their own grade
  return user.grade === targetGrade;
}

// Auto-detect teacher mode based on user role
function isAutoTeacherMode() {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Instructors get teacher mode automatically
  return user.role === 'instructor' || user.role === 'admin';
}

// Auto-detect student mode based on user role  
function isAutoStudentMode() {
  const user = getCurrentUser();
  if (!user) return true; // Default to student mode if no user
  
  // Students get student mode automatically
  return user.role === 'student';
}

// Get current teacher mode state based on user role (replaces manual toggle)
function getCurrentTeacherModeState() {
  return isAutoTeacherMode();
}

// Update teacher mode display based on user role
function updateAutoModeDisplay() {
  const teacherModeIndicator = document.getElementById('teacherModeIndicator');
  if (teacherModeIndicator) {
    const isTeacherMode = getCurrentTeacherModeState();
    teacherModeIndicator.classList.toggle('hidden', !isTeacherMode);
  }
}

// ============= Page Protection Functions =============

// Protect page - redirect if not authenticated
function requireAuth() {
  if (!isLoggedIn()) {
    handleAuthError('يجب تسجيل الدخول للوصول إلى هذه الصفحة');
    return false;
  }
  return true;
}

// Protect page - require specific role
function requireRole(role) {
  if (!requireAuth()) return false;
  
  if (!hasRole(role)) {
    showNotification(`ليس لديك صلاحية الوصول إلى هذه الصفحة (مطلوب: ${role})`, 'error');
    return false;
  }
  return true;
}

// Protect page - require instructor privileges
function requireInstructorPrivileges() {
  if (!requireAuth()) return false;
  
  if (!hasInstructorPrivileges()) {
    showNotification('هذه الصفحة مخصصة للمدرسين والمشرفين فقط', 'error');
    return false;
  }
  return true;
}

// Protect page - require specific grade access
function requireGradeAccess(targetGrade) {
  if (!requireAuth()) return false;
  
  if (!hasGradeAccess(targetGrade)) {
    showNotification(`ليس لديك صلاحية للوصول إلى ${targetGrade}`, 'error');
    return false;
  }
  return true;
}

// ============= UI Helper Functions =============

// Show notification (can be overridden by each page)
function showNotification(message, type = 'info') {
  // Default implementation - can be overridden
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // Try to use the page's notification system if available
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    alert(message);
  }
}

// Update page UI based on auth state
function updateAuthUI() {
  const user = getCurrentUser();
  
  // Update user info displays
  const userNameElements = document.querySelectorAll('.user-name');
  const userEmailElements = document.querySelectorAll('.user-email');
  const userRoleElements = document.querySelectorAll('.user-role');
  
  if (user) {
    userNameElements.forEach(el => el.textContent = user.firstName || user.name);
    userEmailElements.forEach(el => el.textContent = user.email);
    userRoleElements.forEach(el => el.textContent = user.role);
  }
  
  // Show/hide auth-dependent elements
  const authRequiredElements = document.querySelectorAll('.auth-required');
  const guestOnlyElements = document.querySelectorAll('.guest-only');
  
  authRequiredElements.forEach(el => {
    el.style.display = isLoggedIn() ? '' : 'none';
  });
  
  guestOnlyElements.forEach(el => {
    el.style.display = isLoggedIn() ? 'none' : '';
  });
  
  // Role-based visibility
  const instructorOnlyElements = document.querySelectorAll('.instructor-only');
  const adminOnlyElements = document.querySelectorAll('.admin-only');
  
  instructorOnlyElements.forEach(el => {
    el.style.display = hasInstructorPrivileges() ? '' : 'none';
  });
  
  adminOnlyElements.forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });
}

// ============= Auto-initialization =============

// Auto-update UI when page loads
document.addEventListener('DOMContentLoaded', function() {
  if (typeof window.authAutoInit !== 'false') {
    updateAuthUI();
  }
});

// ============= Export for other files =============

// Make functions available globally
window.AUTH = {
  // Core functions
  getAuthToken,
  getCurrentUser,
  isLoggedIn,
  saveUserSession,
  clearUserSession,
  
  // API functions
  protectedRequest,
  handleAuthError,
  handleVerificationRequired,
  redirectToLogin,
  
  // Role functions
  hasRole,
  isStudent,
  isInstructor,
  isAdmin,
  hasInstructorPrivileges,
  hasGradeAccess,
  
  // Auto mode functions
  isAutoTeacherMode,
  isAutoStudentMode,
  getCurrentTeacherModeState,
  updateAutoModeDisplay,
  
  // Protection functions
  requireAuth,
  requireRole,
  requireInstructorPrivileges,
  requireGradeAccess,
  
  // UI functions
  showNotification,
  updateAuthUI,
  getUserDisplayName,
  getUserAvatar,
  
  // Config
  CONFIG: AUTH_CONFIG
};

console.log('🔐 Auth utility loaded successfully');