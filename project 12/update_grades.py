#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
سكريبت لتحديث صفحات الدرجات لاستخدام النظام التلقائي لوضع المعلم
"""

import os
import re

# قائمة بصفحات الدرجات
grade_pages = [
    "grade2_1.html",
    "grade2_2.html", 
    "grade3_1.html",
    "grade3_2.html"
]

base_path = r"d:\New folder (5)\courses_f\project 12\pages"

def update_grade_page(page_name):
    """تحديث صفحة درجة معينة"""
    file_path = os.path.join(base_path, page_name)
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return False
        
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # حذف زر التبديل إذا لم يكن محذوفاً بعد
        button_pattern = r'<button id="modeToggle"[^>]*onclick="toggleMode\(\)"[^>]*>.*?</button>'
        content = re.sub(button_pattern, '', content, flags=re.DOTALL)
        
        # إضافة ملف teacher-mode.js قبل </body> إذا لم يكن موجود
        if '../js/teacher-mode.js' not in content:
            content = content.replace(
                '</body>\n</html>',
                '''  
  <!-- Teacher Mode Auto System -->
  <script src="../js/teacher-mode.js"></script>
</body>
</html>'''
            )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Updated: {page_name}")
        return True
        
    except Exception as e:
        print(f"Error updating {page_name}: {e}")
        return False

def main():
    """التحديث الرئيسي"""
    print("Starting grade pages update...")
    
    updated_count = 0
    for page in grade_pages:
        if update_grade_page(page):
            updated_count += 1
    
    print(f"Updated {updated_count}/{len(grade_pages)} pages successfully")

if __name__ == "__main__":
    main()