/**
 * ملف JavaScript مشترك لتحميل وإدارة Header لجميع صفحات الصفوف
 * يقوم بتحميل Header من ملف مشترك وتخصيص عنوان الصف
 */

// معلومات الصفوف
const gradeInfo = {
  'grade1': 'الصف الأول الثانوي',
  'grade2_1': 'الصف الثاني الثانوي علمي', 
  'grade2_2': 'الصف الثاني الثانوي أدبي',
  'grade3_1': 'الصف الثالث الثانوي علمي',
  'grade3_2': 'الصف الثالث الثانوي أدبي'
};

/**
 * تحميل Header المشترك وتخصيصه
 */
async function loadSharedHeader(gradeKey) {
  try {
    // تحميل ملف Header
    const response = await fetch('../shared/shared-header.html');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const headerHTML = await response.text();
    
    // البحث عن عنصر container للHeader أو إنشاؤه
    let headerContainer = document.getElementById('shared-header-container');
    if (!headerContainer) {
      headerContainer = document.createElement('div');
      headerContainer.id = 'shared-header-container';
      
      // إدراج Header بعد زر الوضع الليلي
      const themeToggle = document.getElementById('themeToggle');
      if (themeToggle) {
        themeToggle.insertAdjacentElement('afterend', headerContainer);
      } else {
        // إدراجه في بداية body إذا لم يجد زر الوضع الليلي
        document.body.insertBefore(headerContainer, document.body.firstChild);
      }
    }
    
    // إدراج HTML الخاص بالHeader
    headerContainer.innerHTML = headerHTML;
    
    // تخصيص عنوان الصف
    const gradeTitle = document.getElementById('gradeTitle');
    if (gradeTitle && gradeInfo[gradeKey]) {
      gradeTitle.textContent = gradeInfo[gradeKey];
    }
    
    // تخصيص عنوان الصفحة
    if (gradeInfo[gradeKey]) {
      document.title = `${gradeInfo[gradeKey]} - منصة البداية`;
    }
    
    // إعداد أحداث Header
    setupHeaderEvents();
    
    // إضافة CSS للوضع الداكن
    addDarkModeCSS();
    
    // إعداد أزرار المعلم إذا كان في وضع المعلم
    setupTeacherButtons();
    
    console.log(`✅ تم تحميل Header بنجاح للصف: ${gradeInfo[gradeKey]}`);
    
  } catch (error) {
    console.error('❌ خطأ في تحميل Header المشترك:', error);
    // في حالة الفشل، عرض header بسيط
    showFallbackHeader(gradeKey);
  }
}

/**
 * إعداد الأحداث الخاصة بالHeader
 */
function setupHeaderEvents() {
  // User menu toggle
  const userBtn = document.getElementById("userMenuBtn");
  const userMenu = document.getElementById("userMenu");
  
  if (userBtn && userMenu) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
    });
    
    // إخفاء القائمة عند النقر خارجها
    document.addEventListener("click", () => {
      userMenu.classList.add("hidden");
    });
  }

  // Logout buttons
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtn2 = document.getElementById("logoutBtn2");
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  
  if (logoutBtn2) {
    logoutBtn2.addEventListener("click", handleLogout);
  }
  
  // إعداد التبويبات
  setupTabs();
}

/**
 * إعداد التبويبات
 */
function setupTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // إزالة الفئة النشطة من جميع التبويبات
      tabs.forEach(t => t.classList.remove('active'));
      
      // إضافة الفئة النشطة للتبويب المحدد
      tab.classList.add('active');
      
      // إخفاء جميع المحتويات
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
      });
      
      // إظهار المحتوى المطلوب
      const targetTab = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.classList.remove('hidden');
      }
    });
  });
}

/**
 * معالج تسجيل الخروج
 */
function handleLogout() {
  if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
    // مسح بيانات المستخدم المحفوظة
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    
    // التوجه إلى صفحة تسجيل الدخول
    window.location.href = '../index.html';
  }
}

/**
 * عرض header بسيط في حالة فشل تحميل Header المشترك
 */
function showFallbackHeader(gradeKey) {
  const fallbackHTML = `
    <header class="bg-white shadow-lg">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-800">${gradeInfo[gradeKey] || 'منصة البداية'}</h1>
      </div>
    </header>
  `;
  
  let headerContainer = document.getElementById('shared-header-container');
  if (!headerContainer) {
    headerContainer = document.createElement('div');
    headerContainer.id = 'shared-header-container';
    document.body.insertBefore(headerContainer, document.body.firstChild);
  }
  
  headerContainer.innerHTML = fallbackHTML;
}

/**
 * تحديد نوع الصف تلقائياً من اسم الملف
 */
function detectGradeFromPath() {
  const path = window.location.pathname;
  const filename = path.split('/').pop().split('.')[0]; // استخراج اسم الملف بدون امتداد
  
  // التحقق من وجود نوع الصف في معلومات الصفوف
  if (gradeInfo[filename]) {
    return filename;
  }
  
  // البحث في معلومات الصفوف بناءً على جزء من اسم الملف
  for (const [key, value] of Object.entries(gradeInfo)) {
    if (filename.includes(key) || path.includes(key)) {
      return key;
    }
  }
  
  // القيمة الافتراضية
  return 'grade1';
}

/**
 * تهيئة Header عند تحميل الصفحة
 */
document.addEventListener('DOMContentLoaded', () => {
  // تحديد نوع الصف تلقائياً
  const gradeKey = detectGradeFromPath();
  
  // تحميل Header المشترك
  loadSharedHeader(gradeKey);
  
  // الاستماع لتحديثات وضع المعلم
  document.addEventListener('teacher-mode-changed', setupTeacherButtons);
  
  // إعادة إعداد أزرار المعلم كل فترة للتأكد من التحديث
  setInterval(setupTeacherButtons, 2000);
});

/**
 * إضافة CSS للوضع الداكن إذا لم يكن موجوداً
 */
function addDarkModeCSS() {
  const existingStyle = document.getElementById('shared-header-dark-mode-css');
  if (existingStyle) return;
  
  const style = document.createElement('style');
  style.id = 'shared-header-dark-mode-css';
  style.textContent = `
    html.dark .teacher-mode-indicator {
      background: linear-gradient(135deg, #8b5cf6, #a855f7);
      color: white;
    }
    html.dark #shared-header-container .bg-green-600:hover { background-color: #059669; }
    html.dark #shared-header-container .bg-purple-600:hover { background-color: #7c3aed; }
    html.dark #shared-header-container .bg-orange-600:hover { background-color: #ea580c; }
    html.dark #shared-header-container .bg-pink-600:hover { background-color: #db2777; }
  `;
  document.head.appendChild(style);
}

/**
 * إعداد أزرار المعلم - إظهار/إخفاء بناءً على الصلاحيات
 */
function setupTeacherButtons() {
  // التحقق من وضع المعلم
  let isTeacherMode = false;
  let canManageFromAPI = false;
  
  // محاولة الحصول على وضع المعلم من مصادر مختلفة
  try {
    // من نظام TeacherMode إذا كان متاحاً
    if (typeof TeacherMode !== 'undefined') {
      isTeacherMode = TeacherMode.isTeacherMode;
    }
    // من LessonsAPI إذا كان متاحاً
    else if (typeof window.LessonsAPI !== 'undefined' && window.LessonsAPI.canManage) {
      canManageFromAPI = window.LessonsAPI.canManage();
      isTeacherMode = canManageFromAPI;
    }
    // من AUTH إذا كان متاحاً  
    else if (typeof AUTH !== 'undefined' && AUTH.getCurrentTeacherModeState) {
      isTeacherMode = AUTH.getCurrentTeacherModeState();
    }
    // من getCurrentUser إذا كان متاحاً
    else if (typeof getCurrentUser !== 'undefined') {
      const user = getCurrentUser();
      isTeacherMode = user && (user.role === 'instructor' || user.role === 'admin');
    }
    // من localStorage كـ fallback
    else {
      isTeacherMode = localStorage.getItem('globalTeacherMode') === 'true';
    }
  } catch (error) {
    console.log('تعذر التحقق من وضع المعلم:', error);
    isTeacherMode = false;
  }
  
  // إظهار/إخفاء أزرار المعلم
  const teacherButtons = [
    'addLessonHeaderBtn',
    'addScheduleHeaderBtn', 
    'addHomeworkHeaderBtn',
    'addQuizHeaderBtn',
    'calendarHeaderBtn',
    'gradesHeaderBtn'
  ];
  
  teacherButtons.forEach(buttonId => {
    const button = document.getElementById(buttonId);
    if (button) {
      if (isTeacherMode || canManageFromAPI) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
    }
  });
  
  // إظهار/إخفاء مؤشر وضع المعلم
  const teacherIndicator = document.getElementById('teacherModeIndicator');
  if (teacherIndicator) {
    if (isTeacherMode || canManageFromAPI) {
      teacherIndicator.classList.remove('hidden');
    } else {
      teacherIndicator.classList.add('hidden');
    }
  }
  
  // إظهار أزرار Header أيضاً للصفحات التي ما زالت تستخدم النظام القديم
  if (isTeacherMode || canManageFromAPI) {
    // إظهار الأزرار في Header القديم إذا وجدت
    const legacyButtons = ['addLessonHeaderBtn', 'addScheduleHeaderBtn', 'addHomeworkHeaderBtn'];
    legacyButtons.forEach(buttonId => {
      const legacyButton = document.querySelector(`#${buttonId}:not(#shared-header-container #${buttonId})`);
      if (legacyButton) {
        legacyButton.classList.remove('hidden');
      }
    });
  }
  
  console.log('Teacher mode setup:', { isTeacherMode, canManageFromAPI });
}

/**
 * التنقل إلى صفحة محددة
 */
function navigateToPage(pagePath) {
  // التأكد من أن المسار صحيح
  if (pagePath.startsWith('add-') || pagePath.startsWith('calendar') || pagePath.startsWith('grades')) {
    // إذا كنا في مجلد فرعي، نضيف ../pages/
    if (window.location.pathname.includes('/pages/') || window.location.pathname.includes('grade')) {
      window.location.href = `../pages/${pagePath}`;
    } else {
      window.location.href = `pages/${pagePath}`;
    }
  } else {
    window.location.href = pagePath;
  }
}

// تصدير الدوال للاستخدام في ملفات أخرى
if (typeof window !== 'undefined') {
  window.SharedHeader = {
    load: loadSharedHeader,
    setupEvents: setupHeaderEvents,
    setupTeacherButtons: setupTeacherButtons,
    detectGrade: detectGradeFromPath,
    navigateToPage: navigateToPage
  };
  
  // جعل navigateToPage متاحة عالمياً
  window.navigateToPage = navigateToPage;
}