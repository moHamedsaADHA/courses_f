// ============= Authentication Utility Library =============
// يمكن استخدام هذا الملف في جميع صفحات المشروع

const AUTH_CONFIG = {
  API_BASE_URL: 'https://courses-pj.vercel.app/api',
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  TEMP_TOKEN_KEY: 'tempToken',
  USER_EMAIL_KEY: 'userEmail',
  RESET_TOKEN_KEY: 'resetToken',
  DEFAULT_AVATAR: '../images/default_user.png' // مسار الصورة الافتراضية
};

// ============= Core Authentication Functions =============

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
}

// Get user data from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  
  // تسجيل للتصحيح
  console.log("Raw user data from localStorage:", userStr);
  
  if (!userStr) {
    console.log("No user data in localStorage");
    return null;
  }
  
  try {
    const userData = JSON.parse(userStr);
    console.log("Parsed user data:", userData);
    return userData;
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
}

// Get user's display name
function getUserDisplayName() {
  const user = getCurrentUser();
  console.log("User data:", user); // تسجيل بيانات المستخدم للتصحيح
  
  if (!user) {
    console.log("No user data found");
    return "مستخدم";
  }
  
  // التحقق من وجود الاسم واستخراج الجزء الأول إذا كان الاسم طويلاً
  if (user.name) {
    const fullName = user.name.trim();
    console.log("Full name:", fullName);
    // استخراج الاسم الأول أو اسمين فقط للعرض في الناف بار
    const nameParts = fullName.split(' ');
    if (nameParts.length > 1) {
      return nameParts[0] + ' ' + nameParts[1]; // إرجاع الاسم الأول والثاني فقط
    }
    return fullName;
  } else if (user.username) {
    return user.username;
  } else if (user.email) {
    // استخراج الجزء الأول من الإيميل قبل @
    return user.email.split('@')[0];
  }
  
  return "مستخدم";
}

// Get user's avatar
function getUserAvatar() {
  const user = getCurrentUser();
  return user && user.avatar ? user.avatar : AUTH_CONFIG.DEFAULT_AVATAR;
}

// Check if user is logged in
function isLoggedIn() {
  return getAuthToken() && getCurrentUser();
}

// Save user session
function saveUserSession(token, user) {
  // إضافة الصورة الافتراضية إذا لم تكن موجودة
  if (!user.avatar) {
    user.avatar = AUTH_CONFIG.DEFAULT_AVATAR;
  }
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
    throw new Error('No authentication token found');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}${endpoint}`, config);
  
  // Handle token expiration
  if (response.status === 401) {
    clearUserSession();
    window.location.reload();
    throw new Error('Session expired, please login again');
  }
  
  return response;
}

// Make API request
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const config = {
    ...options,
    headers
  };
  
  return fetch(`${AUTH_CONFIG.API_BASE_URL}${endpoint}`, config);
}

// ============= Authentication API Functions =============

// Register user
async function registerUser(userData) {
  try {
    const response = await apiRequest('/users/', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Store temp token for OTP verification
      localStorage.setItem(AUTH_CONFIG.TEMP_TOKEN_KEY, result.tempToken);
      localStorage.setItem(AUTH_CONFIG.USER_EMAIL_KEY, result.user.email);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Login user
async function loginUser(credentials) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      saveUserSession(result.token, result.user);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Verify OTP
async function verifyOtp(otp) {
  try {
    const token = localStorage.getItem(AUTH_CONFIG.TEMP_TOKEN_KEY);
    if (!token) {
      return {
        success: false,
        status: 401,
        data: { message: 'Session expired, please register again' }
      };
    }
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ otp })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Clear temp token after successful verification
      localStorage.removeItem(AUTH_CONFIG.TEMP_TOKEN_KEY);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Resend OTP
async function resendOtp(email) {
  try {
    const token = localStorage.getItem(AUTH_CONFIG.TEMP_TOKEN_KEY);
    if (!token) {
      return {
        success: false,
        status: 401,
        data: { message: 'Session expired, please register again' }
      };
    }
    
    const response = await fetch(`${AUTH_CONFIG.API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Forgot password
async function forgotPassword(email) {
  try {
    const response = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Reset password
async function resetPassword(token, newPassword) {
  try {
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      localStorage.removeItem(AUTH_CONFIG.RESET_TOKEN_KEY);
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      status: 0,
      data: { message: 'Network error, please check your connection' }
    };
  }
}

// Logout
function logout() {
  clearUserSession();
  window.location.reload();
}

// ============= Page Protection Functions =============

// Protect page (redirect if not authenticated)
function protectPage(redirectUrl = '/') {
  if (!isLoggedIn()) {
    window.location.href = redirectUrl;
  }
}

// Protect page by role
function protectPageByRole(roles = [], redirectUrl = '/') {
  const user = getCurrentUser();
  
  if (!isLoggedIn()) {
    window.location.href = redirectUrl;
    return;
  }
  
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    window.location.href = redirectUrl;
  }
}

// Redirect if authenticated
function redirectIfAuthenticated(redirectUrl = '/dashboard.html') {
  if (isLoggedIn()) {
    window.location.href = redirectUrl;
  }
}

// ============= Global Wrapper (for legacy / other modules) =============
// توفير كائن عالمي موحد للوصول للدوال بدون افتراض الترتيب الصارم للتحميل
if(!window.AUTH){
  window.AUTH = {};
}
// دمج الدوال إن لم تكن موجودة أو لتحديثها
Object.assign(window.AUTH, {
  CONFIG: AUTH_CONFIG,
  getAuthToken,
  getCurrentUser,
  getUserDisplayName,
  getUserAvatar,
  isLoggedIn,
  saveUserSession,
  clearUserSession,
  protectedRequest,
  apiRequest,
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
  protectPage,
  protectPageByRole,
  redirectIfAuthenticated
});

// إشارة يمكن للأكواد الأخرى الاستماع لها لمعرفة جاهزية AUTH
if(!window.__AUTH_READY_EMITTED__){
  window.__AUTH_READY_EMITTED__ = true;
  document.dispatchEvent(new CustomEvent('auth:ready'));
}