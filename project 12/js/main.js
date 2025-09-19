/**
 * منصة البداية - وظائف JavaScript الرئيسية
 * تم إنشاؤه: سبتمبر 2025
 */

// ============= Configuration & Constants =============
const API_BASE_URL = 'https://courses-pj.vercel.app/api';
const TEST_MODE = false; // Set to true for testing without backend

let resendTimer = 0;
let resendInterval;

// ============= Form Validation Functions =============

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
  return password.length >= 8 && 
          /[A-Z]/.test(password) && 
          /[a-z]/.test(password) && 
          /\d/.test(password);
}

// Validate Arabic/English names (2-20 characters)
function validateName(name) {
  const nameRegex = /^[\u0621-\u064A\u0660-\u0669a-zA-Z\s]{2,20}$/;
  return nameRegex.test(name.trim());
}

// Validate Egyptian phone number
function validatePhone(phone) {
  if (!phone) return true; // Optional field
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

// Validate full name according to backend requirements
function validateFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    return false;
  }
  
  const trimmedName = fullName.trim();
  
  // Check length (10-100 characters)
  if (trimmedName.length < 10 || trimmedName.length > 100) {
    return false;
  }
  
  // Check that it contains only letters and spaces (Arabic or English)
  const nameRegex = /^[\u0621-\u064A\u0660-\u0669a-zA-Z\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return false;
  }
  
  // Check that it contains at least 3 separate names
  const names = trimmedName.split(/\s+/).filter(name => name.length > 0);
  if (names.length < 3) {
    return false;
  }
  
  // Check each name part (at least 2 characters each)
  return names.every(name => name.length >= 2);
}

// Split full name into parts
function splitFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') {
    console.error('Invalid fullName provided:', fullName);
    return {
      firstName: '',
      secondName: '',
      thirdName: '',
      fourthName: ''
    };
  }
  
  const names = fullName.trim().split(/\s+/).filter(name => name.length > 0);
  return {
    firstName: names[0] || '',
    secondName: names[1] || '',
    thirdName: names[2] || '',
    fourthName: names[3] || names[2] || '' // If only 3 names, use third as fourth
  };
}

// ============= Form Validation Functions =============
function validateRegistrationForm(formData) {
  console.log('🔍 بدء التحقق من بيانات التسجيل...');
  const errors = [];
  
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');
  const location = formData.get('location');
  const grade = formData.get('grade');
  const phone = formData.get('phone');
  
  console.log('📝 البيانات المستلمة:', {
    fullName: fullName ? `"${fullName.substring(0, 30)}" (${fullName.length} حرف)` : 'فارغ',
    email: email || 'فارغ',
    phone: phone || 'فارغ',
    location: location || 'غير محدد',
    grade: grade || 'غير محدد'
  });
  
  // Validate full name with detailed logging
  console.log('🔤 فحص الاسم الرباعي...');
  if (!fullName || !fullName.trim()) {
    console.log('❌ الاسم فارغ');
    errors.push('الاسم الرباعي مطلوب');
  } else {
    const nameLength = fullName.trim().length;
    const isNameValid = validateFullName(fullName);
    console.log(`📏 طول الاسم: ${nameLength}، صحيح: ${isNameValid}`);
    
    if (nameLength < 10) {
      errors.push(`الاسم قصير جداً - أدخل ${10 - nameLength} حرف إضافي على الأقل`);
    } else if (nameLength > 100) {
      errors.push(`الاسم طويل جداً - احذف ${nameLength - 100} حرف`);
    } else if (!isNameValid) {
      const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
      console.log(`🔢 عدد أجزاء الاسم: ${nameParts.length}`);
      if (nameParts.length < 3) {
        errors.push(`يجب إدخال 3 أسماء على الأقل مفصولة بمسافات (لديك ${nameParts.length} فقط)`);
      }
    }
  }
  
  if (!validateEmail(email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  if (!validatePassword(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع حرف كبير وصغير ورقم');
  }
  if (!location) {
    errors.push('يجب اختيار المكان');
  }
  if (!grade) {
    errors.push('يجب اختيار الصف الدراسي');
  }
  if (phone && phone.trim() && !validatePhone(phone)) {
    errors.push('رقم الهاتف غير صحيح (يجب أن يبدأ بـ 010, 011, 012, أو 015)');
  }
  
  console.log(errors.length === 0 ? '✅ جميع البيانات صحيحة!' : '❌ الأخطاء الموجودة:', errors);
  return errors;
}

// Validate login form
function validateLoginForm(email, password) {
  const errors = [];
  
  if (!validateEmail(email)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  if (!password || password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  
  return errors;
}

// ============= UI Helper Functions =============

// Show loading state
function showLoading(buttonId, loadingText = 'جاري التحميل...') {
  const button = document.getElementById(buttonId);
  button.disabled = true;
  button.innerHTML = loadingText;
}

// Hide loading state
function hideLoading(buttonId, originalText) {
  const button = document.getElementById(buttonId);
  button.innerHTML = originalText;
  button.disabled = false;
}

// Show error message
function showError(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = message;
  container.classList.remove('hidden');
  setTimeout(() => container.classList.add('hidden'), 5000);
}

// Show success message
function showSuccess(containerId, message) {
  const container = document.getElementById(containerId);
  container.innerHTML = message;
  container.classList.remove('hidden');
  setTimeout(() => container.classList.add('hidden'), 5000);
}

// ============= Modal Functions =============

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('show');
    // Focus on first input if exists
    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 10);
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// Show tooltip
function showTooltip(element, message) {
  let tooltip = element.nextElementSibling;
  if (!tooltip || !tooltip.classList.contains('tooltip')) {
    tooltip = document.createElement('div');
    tooltip.className = 'tooltip absolute z-10 w-full mt-1 p-2 bg-red-600 text-white text-xs rounded-md';
    element.parentNode.insertBefore(tooltip, element.nextSibling);
  }
  tooltip.textContent = message;
  tooltip.style.display = 'block';
}

// Hide tooltip
function hideTooltip(element) {
  const tooltip = element.nextElementSibling;
  if (tooltip && tooltip.classList.contains('tooltip')) {
    tooltip.style.display = 'none';
  }
}

// ============= Theme Functions =============

// Toggle theme (light/dark)
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isDarkMode = !document.body.classList.contains('light-mode');
  localStorage.setItem('darkMode', isDarkMode.toString());
}

// Apply saved theme on load
function applyTheme() {
  const isDarkMode = localStorage.getItem('darkMode') !== 'false';
  if (!isDarkMode) {
    document.body.classList.add('light-mode');
  }
}

// ============= Teacher Mode Functions =============

// Update teacher mode display based on user role (automatic)
function updateGlobalModeDisplay() {
  if (typeof AUTH !== 'undefined' && AUTH.updateAutoModeDisplay) {
    AUTH.updateAutoModeDisplay();
  }
}

// ============= Mobile Menu Functions =============

// Toggle mobile menu
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('hidden');
  menu.classList.toggle('flex');
}

// ============= Document Ready Function =============

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page loaded, initializing...');
  
  updateGlobalModeDisplay();
  checkAuthState();
  setupEventListeners();
  
  console.log('Event listeners set up');
  
  // Typed effect
  new Typed('#typed-text', {
    strings: ['🚀 منصة البداية', '✨ مستقبلك يبدأ من هنا', '📚 تعلم وتفوق مع البداية'],
    typeSpeed: 60,
    backSpeed: 40,
    loop: true
  });

  // Check for reset password token in URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('reset-token');
  if (resetToken) {
    localStorage.setItem('resetToken', resetToken);
    openModal('resetPasswordModal');
  }
});

// Setup all event listeners
function setupEventListeners() {
  // Menu toggle
  document.getElementById('menuToggle').addEventListener('click', toggleMobileMenu);
  
  // Auth modal open/close
  document.getElementById('openLogin').addEventListener('click', () => openModal('loginModal'));
  document.getElementById('openRegister').addEventListener('click', () => openModal('registerModal'));
  document.getElementById('openLoginMobile').addEventListener('click', () => {
    closeModal('mobileMenu');
    openModal('loginModal');
  });
  document.getElementById('openRegisterMobile').addEventListener('click', () => {
    closeModal('mobileMenu');
    openModal('registerModal');
  });
  
  // Set up close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal').id);
    });
  });
  
  // Close on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
  
  // Register form submission
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  
  // Login form submission
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // OTP form submission
  document.getElementById('otpForm').addEventListener('submit', handleVerifyOtp);
  
  // Resend OTP button
  document.getElementById('resendOtpButton').addEventListener('click', handleResendOtp);
  
  // Forgot password links
  document.querySelectorAll('.forgot-password-link').forEach(link => {
    link.addEventListener('click', () => {
      closeModal('loginModal');
      openModal('forgotPasswordModal');
    });
  });
  
  // Forgot password form
  document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
  
  // Reset password form
  document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);
  
  // Switch to register/login
  document.getElementById('switchToRegister').addEventListener('click', () => {
    closeModal('loginModal');
    openModal('registerModal');
  });
  
  document.getElementById('switchToLogin').addEventListener('click', () => {
    closeModal('registerModal');
    openModal('loginModal');
  });
  
  // Full name validation
  const fullNameInput = document.getElementById('fullName');
  const fullNameIndicator = document.getElementById('fullNameIndicator');
  const nameCount = document.getElementById('nameCount');
  
  if (fullNameInput) {
    fullNameInput.addEventListener('input', function() {
      const value = this.value;
      
      // Update character count
      if (nameCount) {
        nameCount.textContent = `${value.length}/100 حرف`;
        if (fullNameIndicator) {
          fullNameIndicator.classList.remove('hidden');
        }
      }
      
      if (value.length > 0) {
        if (value.length < 10) {
          this.style.borderColor = '#ef4444';
          if (nameCount) nameCount.className = 'text-red-400';
          showTooltip(this, `الاسم قصير جداً (${value.length}/10 أحرف على الأقل)`);
        } else if (value.length > 100) {
          this.style.borderColor = '#ef4444';
          if (nameCount) nameCount.className = 'text-red-400';
          showTooltip(this, `الاسم طويل جداً (${value.length}/100 حرف كحد أقصى)`);
        } else if (!validateFullName(value)) {
          this.style.borderColor = '#ef4444';
          if (nameCount) nameCount.className = 'text-yellow-400';
          showTooltip(this, 'يجب إدخال 3 أسماء على الأقل مفصولة بمسافات');
        } else {
          this.style.borderColor = '#10b981';
          if (nameCount) nameCount.className = 'text-green-400';
          hideTooltip(this);
        }
      } else {
        if (fullNameIndicator) {
          fullNameIndicator.classList.add('hidden');
        }
      }
    });
    
    fullNameInput.addEventListener('blur', function() {
      if (this.value && !validateFullName(this.value)) {
        this.style.borderColor = '#ef4444';
      }
    });
  }
}

// ============= Authentication Functions =============

// Handle user registration
async function handleRegister(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  
  // Validate the form
  const errors = validateRegistrationForm(formData);
  if (errors.length > 0) {
    showError('registerErrors', errors.join('<br>'));
    return;
  }
  
  showLoading('registerSubmitBtn', '<span class="loading"></span>');
  
  const fullName = formData.get('fullName');
  
  // Validate full name using existing validation function
  if (!validateFullName(fullName)) {
    showError('registerErrors', 'يجب إدخال اسم رباعي صحيح (3 أسماء على الأقل، 10-100 حرف)');
    hideLoading('registerSubmitBtn', 'إنشاء الحساب');
    return;
  }
  
  const userData = {
    name: fullName.trim(), // Send full name as single field
    email: formData.get('email'),
    password: formData.get('password'),
    location: formData.get('location'),
    grade: formData.get('grade'),
    role: 'student' // Always student as requested
  };
  
  // Add phone number only if provided
  const phoneNumber = formData.get('phone');
  if (phoneNumber && phoneNumber.trim()) {
    userData.phoneNumber = phoneNumber.trim();
  }
  
  // Clean up userData - remove undefined values
  Object.keys(userData).forEach(key => {
    if (userData[key] === undefined) {
      delete userData[key];
    }
  });
  
  console.log('📤 User data to be sent:', userData);
  console.log('📝 Form data details:', {
    name: `"${userData.name}" (${userData.name?.length} حرف)`,
    email: userData.email,
    password: userData.password ? `${userData.password.length} حرف` : 'فارغ',
    phoneNumber: userData.phoneNumber || 'غير متوفر',
    location: userData.location,
    grade: userData.grade
  });
  
  try {
    if (TEST_MODE) {
      // Test mode - simulate successful registration
      console.log('TEST MODE: Simulating successful registration');
      showSuccess('registerSuccess', 'تم إنشاء الحساب بنجاح (وضع اختبار)');
      setTimeout(() => {
        closeModal('registerModal');
        openOtpModal(userData.email);
      }, 1500);
      return;
    }
    
    console.log('Sending request to:', `${API_BASE_URL}/users/`);
    console.log('Request payload:', JSON.stringify(userData));
    
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const result = await response.json();
    console.log('📥 Response data:', result);
    
    if (response.ok) {
      // Success - store temp token and show OTP modal
      console.log('✅ Registration successful!');
      localStorage.setItem('tempToken', result.tempToken);
      localStorage.setItem('userEmail', result.user.email);
      
      showSuccess('registerSuccess', result.message);
      setTimeout(() => {
        closeModal('registerModal');
        openOtpModal(result.user.email);
      }, 1500);
    } else {
      // Handle errors
      console.log('❌ Registration failed with status:', response.status);
      if (result.errors && Array.isArray(result.errors)) {
        console.log('🚫 Server validation errors:', result.errors);
        const errorMessages = result.errors
          .map(error => `• ${error.msg}`)
          .join('<br>');
        showError('registerErrors', `خطأ في البيانات:<br>${errorMessages}`);
      } else if (result.message) {
        showError('registerErrors', result.message);
      } else {
        showError('registerErrors', 'حدث خطأ أثناء إنشاء الحساب، الرجاء المحاولة مرة أخرى');
      }
    }
  } catch (error) {
    console.error('Error during registration:', error);
    showError('registerErrors', 'حدث خطأ في الإتصال، الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
  } finally {
    hideLoading('registerSubmitBtn', 'إنشاء الحساب');
  }
}

// Handle user login
async function handleLogin(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  
  // Validate login form
  const errors = validateLoginForm(email, password);
  if (errors.length > 0) {
    showError('loginErrors', errors.join('<br>'));
    return;
  }
  
  showLoading('loginSubmitBtn', '<span class="loading"></span>');
  
  try {
    if (TEST_MODE) {
      // Test mode - simulate successful login
      console.log('TEST MODE: Simulating successful login');
      setTimeout(() => {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('user', JSON.stringify({
          email,
          role: 'student',
          grade
        }));
        showSuccess('loginSuccess', 'تم تسجيل الدخول بنجاح (وضع اختبار)');
        setTimeout(() => {
          closeModal('loginModal');
          window.location.reload();
        }, 1000);
      }, 1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email,
        password
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success - store token and reload
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      showSuccess('loginSuccess', result.message || 'تم تسجيل الدخول بنجاح');
      setTimeout(() => {
        closeModal('loginModal');
        window.location.reload();
      }, 1000);
    } else {
      // Handle login error
      if (result.message) {
        showError('loginErrors', result.message);
      } else {
        showError('loginErrors', 'فشل تسجيل الدخول، الرجاء التحقق من البريد الإلكتروني وكلمة المرور');
      }
    }
  } catch (error) {
    console.error('Error during login:', error);
    showError('loginErrors', 'حدث خطأ في الإتصال، الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
  } finally {
    hideLoading('loginSubmitBtn', 'تسجيل الدخول');
  }
}

// Open OTP verification modal
function openOtpModal(email) {
  document.getElementById('otpEmail').innerText = email;
  
  // Reset OTP inputs
  const otpInputs = document.querySelectorAll('.otp-input');
  otpInputs.forEach(input => {
    input.value = '';
  });
  
  // Focus on first input
  if (otpInputs.length > 0) {
    otpInputs[0].focus();
  }
  
  // Reset resend timer
  startResendTimer();
  
  // Open modal
  openModal('otpModal');
}

// Start resend OTP timer
function startResendTimer() {
  const resendBtn = document.getElementById('resendOtpButton');
  resendTimer = 60; // 60 seconds
  resendBtn.disabled = true;
  
  // Clear any existing interval
  if (resendInterval) clearInterval(resendInterval);
  
  // Update button text
  updateResendButtonText();
  
  // Start countdown
  resendInterval = setInterval(() => {
    resendTimer--;
    updateResendButtonText();
    
    if (resendTimer <= 0) {
      clearInterval(resendInterval);
      resendBtn.disabled = false;
      resendBtn.innerText = 'إعادة إرسال الرمز';
    }
  }, 1000);
}

// Update resend button text with timer
function updateResendButtonText() {
  const resendBtn = document.getElementById('resendOtpButton');
  resendBtn.innerText = `إعادة إرسال الرمز (${resendTimer})`;
}

// Handle OTP verification
async function handleVerifyOtp(e) {
  e.preventDefault();
  
  // Get OTP code from inputs
  const otpInputs = document.querySelectorAll('.otp-input');
  let otpCode = '';
  otpInputs.forEach(input => {
    otpCode += input.value;
  });
  
  // Validate OTP format (6 digits)
  if (!/^\d{6}$/.test(otpCode)) {
    showError('otpErrors', 'الرجاء إدخال الرمز المكون من 6 أرقام');
    return;
  }
  
  showLoading('verifyOtpBtn', '<span class="loading"></span>');
  
  try {
    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      showError('otpErrors', 'انتهت صلاحية الجلسة، الرجاء التسجيل مرة أخرى');
      return;
    }
    
    if (TEST_MODE) {
      // Test mode - simulate successful verification
      console.log('TEST MODE: Simulating successful OTP verification');
      setTimeout(() => {
        showSuccess('otpSuccess', 'تم التحقق من الحساب بنجاح (وضع اختبار)');
        setTimeout(() => {
          closeModal('otpModal');
          openModal('loginModal');
        }, 1500);
      }, 1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`
      },
      body: JSON.stringify({ 
        otp: otpCode
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success
      showSuccess('otpSuccess', result.message || 'تم التحقق من الحساب بنجاح');
      
      // Clear temp token
      localStorage.removeItem('tempToken');
      
      setTimeout(() => {
        closeModal('otpModal');
        openModal('loginModal');
      }, 1500);
    } else {
      // Handle verification error
      showError('otpErrors', result.message || 'رمز التحقق غير صحيح');
    }
  } catch (error) {
    console.error('Error during OTP verification:', error);
    showError('otpErrors', 'حدث خطأ في الإتصال، الرجاء المحاولة مرة أخرى');
  } finally {
    hideLoading('verifyOtpBtn', 'تحقق');
  }
}

// Handle resend OTP
async function handleResendOtp() {
  const tempToken = localStorage.getItem('tempToken');
  const userEmail = localStorage.getItem('userEmail');
  
  if (!tempToken || !userEmail) {
    showError('otpErrors', 'انتهت صلاحية الجلسة، الرجاء التسجيل مرة أخرى');
    return;
  }
  
  showLoading('resendOtpButton', '<span class="loading"></span>');
  
  try {
    if (TEST_MODE) {
      // Test mode - simulate successful resend
      console.log('TEST MODE: Simulating successful OTP resend');
      setTimeout(() => {
        showSuccess('otpSuccess', 'تم إعادة إرسال الرمز بنجاح (وضع اختبار)');
        startResendTimer();
      }, 1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tempToken}`
      },
      body: JSON.stringify({ 
        email: userEmail
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success
      showSuccess('otpSuccess', result.message || 'تم إعادة إرسال الرمز بنجاح');
      startResendTimer();
    } else {
      // Handle resend error
      showError('otpErrors', result.message || 'فشل إعادة إرسال الرمز');
    }
  } catch (error) {
    console.error('Error during OTP resend:', error);
    showError('otpErrors', 'حدث خطأ في الإتصال، الرجاء المحاولة مرة أخرى');
  } finally {
    hideLoading('resendOtpButton', 'إعادة إرسال الرمز');
  }
}

// Handle forgot password
async function handleForgotPassword(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  
  if (!validateEmail(email)) {
    showError('forgotPasswordErrors', 'الرجاء إدخال بريد إلكتروني صحيح');
    return;
  }
  
  showLoading('forgotPasswordBtn', '<span class="loading"></span>');
  
  try {
    if (TEST_MODE) {
      // Test mode - simulate successful request
      console.log('TEST MODE: Simulating successful forgot password request');
      setTimeout(() => {
        showSuccess('forgotPasswordSuccess', 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح (وضع اختبار)');
      }, 1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        email 
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success
      showSuccess('forgotPasswordSuccess', result.message || 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح');
      form.reset();
    } else {
      // Handle error
      showError('forgotPasswordErrors', result.message || 'البريد الإلكتروني غير مسجل');
    }
  } catch (error) {
    console.error('Error during forgot password:', error);
    showError('forgotPasswordErrors', 'حدث خطأ في الإتصال، الرجاء المحاولة مرة أخرى');
  } finally {
    hideLoading('forgotPasswordBtn', 'إرسال رابط إعادة التعيين');
  }
}

// Handle reset password
async function handleResetPassword(e) {
  e.preventDefault();
  
  const form = e.target;
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  
  if (!validatePassword(password)) {
    showError('resetPasswordErrors', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير وصغير ورقم');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('resetPasswordErrors', 'كلمات المرور غير متطابقة');
    return;
  }
  
  const resetToken = localStorage.getItem('resetToken');
  if (!resetToken) {
    showError('resetPasswordErrors', 'انتهت صلاحية رابط إعادة التعيين، الرجاء طلب رابط جديد');
    return;
  }
  
  showLoading('resetPasswordBtn', '<span class="loading"></span>');
  
  try {
    if (TEST_MODE) {
      // Test mode - simulate successful reset
      console.log('TEST MODE: Simulating successful password reset');
      setTimeout(() => {
        showSuccess('resetPasswordSuccess', 'تم إعادة تعيين كلمة المرور بنجاح (وضع اختبار)');
        localStorage.removeItem('resetToken');
        setTimeout(() => {
          closeModal('resetPasswordModal');
          openModal('loginModal');
        }, 1500);
      }, 1000);
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        token: resetToken,
        password
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      // Success
      showSuccess('resetPasswordSuccess', result.message || 'تم إعادة تعيين كلمة المرور بنجاح');
      
      // Clear reset token
      localStorage.removeItem('resetToken');
      
      setTimeout(() => {
        closeModal('resetPasswordModal');
        openModal('loginModal');
      }, 1500);
    } else {
      // Handle error
      showError('resetPasswordErrors', result.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
    }
  } catch (error) {
    console.error('Error during password reset:', error);
    showError('resetPasswordErrors', 'حدث خطأ في الإتصال، الرجاء المحاولة مرة أخرى');
  } finally {
    hideLoading('resetPasswordBtn', 'إعادة تعيين كلمة المرور');
  }
}

// Check auth state
function checkAuthState() {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  
  if (token && userJson) {
    try {
      const user = JSON.parse(userJson);
      
      // Update UI based on auth state
      document.querySelectorAll('.authenticated-only').forEach(el => el.classList.remove('hidden'));
      document.querySelectorAll('.unauthenticated-only').forEach(el => el.classList.add('hidden'));
      
      // Update user name display
      const userNameElement = document.getElementById('userName');
      if (userNameElement && user.name) {
        userNameElement.innerText = user.name;
      }
      
      // Check user role
      const isTeacher = user.role === 'teacher';
      document.querySelectorAll('.teacher-only').forEach(el => {
        el.classList.toggle('hidden', !isTeacher);
      });
      
      // Update teacher badge
      const teacherBadge = document.getElementById('teacherBadge');
      if (teacherBadge) {
        teacherBadge.classList.toggle('hidden', !isTeacher);
      }
      
      return true;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return false;
    }
  } else {
    // Not authenticated
    document.querySelectorAll('.authenticated-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.unauthenticated-only').forEach(el => el.classList.remove('hidden'));
    return false;
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
}

// OTP input handling
function setupOtpInputs() {
  const otpInputs = document.querySelectorAll('.otp-input');
  
  otpInputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', function(e) {
      // Allow only numbers
      this.value = this.value.replace(/[^0-9]/g, '');
      
      // Auto move to next input
      if (this.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });
    
    // Handle backspace
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && this.value === '' && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
    
    // Handle paste
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text');
      
      if (!pasteData.match(/^\d+$/)) return;
      
      const digits = pasteData.split('');
      
      // Fill current and next inputs
      otpInputs.forEach((input, i) => {
        if (i >= index && digits.length > i - index) {
          input.value = digits[i - index];
        }
      });
      
      // Move focus to appropriate input
      const nextIndex = Math.min(index + digits.length, otpInputs.length - 1);
      otpInputs[nextIndex].focus();
    });
  });
}