/**
 * Teacher Mode Management - النظام التلقائي لوضع المعلم/الطالب
 * يعمل بناءً على دور المستخدم تلقائياً بدلاً من التحكم اليدوي
 */

// Global teacher mode state based on user role
let isTeacherMode = false;

// Initialize teacher mode based on user role
function initializeTeacherMode() {
  // Get teacher mode state from user role automatically
  if (typeof AUTH !== 'undefined' && AUTH.getCurrentTeacherModeState) {
    isTeacherMode = AUTH.getCurrentTeacherModeState();
  } else {
    // Fallback: check if user is instructor
    const user = getCurrentUser ? getCurrentUser() : null;
    isTeacherMode = user && (user.role === 'instructor' || user.role === 'admin');
  }
  
  console.log('Teacher mode initialized:', isTeacherMode);
  return isTeacherMode;
}

// Update mode display based on user role (automatic)
function updateModeDisplay() {
  const indicator = document.getElementById('teacherModeIndicator');
  
  // Initialize teacher mode based on user role
  initializeTeacherMode();
  
  if (indicator) {
    if (isTeacherMode) {
      indicator.classList.remove('hidden');
      showTeacherTools();
    } else {
      indicator.classList.add('hidden');
      hideTeacherTools();
    }
  }
}

// Show teacher tools (if functions exist)
function showTeacherTools() {
  const teacherToolElements = [
    'scheduleTeacherTools',
    'homeworkTeacherTools', 
    'materialsTeacherTools',
    'quizzesTeacherTools'
  ];
  
  teacherToolElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove('hidden');
    }
  });
}

// Hide teacher tools (if functions exist)
function hideTeacherTools() {
  const teacherToolElements = [
    'scheduleTeacherTools',
    'homeworkTeacherTools',
    'materialsTeacherTools', 
    'quizzesTeacherTools'
  ];
  
  teacherToolElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.add('hidden');
    }
  });
}

// Get current teacher mode state (for use in other functions)
function getCurrentModeState() {
  return isTeacherMode;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Teacher mode script loaded');
  
  // Wait a bit for AUTH to load
  setTimeout(() => {
    initializeTeacherMode();
    updateModeDisplay();
  }, 100);
});

// Make functions available globally
window.TeacherMode = {
  initializeTeacherMode,
  updateModeDisplay,
  showTeacherTools,
  hideTeacherTools,
  getCurrentModeState,
  get isTeacherMode() {
    return isTeacherMode;
  }
};

console.log('🎓 Teacher Mode utility loaded successfully');