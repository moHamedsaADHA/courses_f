// add-quiz.js

document.addEventListener('DOMContentLoaded', function() {
  const quizForm = document.getElementById('quizForm');
  const questionsList = document.getElementById('questionsList');
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  const quizMsg = document.getElementById('quizMsg');

  let questions = [];

  function renderQuestions() {
    questionsList.innerHTML = '';
    questions.forEach((q, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'border rounded p-3 bg-gray-50 relative';
      qDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <span class="font-bold">سؤال #${idx+1}</span>
          <button type="button" class="text-red-600 hover:text-red-800" onclick="this.closest('.question-block').remove(); window.removeQuestion(${idx});"><i class="fas fa-trash"></i></button>
        </div>
        <div class="mb-2">
          <label class="block mb-1">نص السؤال</label>
          <input type="text" class="w-full px-2 py-1 border rounded" value="${q.questionText || ''}" onchange="window.updateQuestionText(${idx}, this.value)">
        </div>
        <div class="mb-2">
          <label class="block mb-1">نوع السؤال</label>
          <select class="w-full px-2 py-1 border rounded" onchange="window.updateQuestionType(${idx}, this.value)">
            <option value="صح وخطأ" ${q.type==='صح وخطأ'?'selected':''}>صح وخطأ</option>
            <option value="اختر من متعدد" ${q.type==='اختر من متعدد'?'selected':''}>اختر من متعدد</option>
          </select>
        </div>
        <div class="mb-2 options-block" style="display:${q.type==='اختر من متعدد'?'block':'none'}">
          <label class="block mb-1">الخيارات</label>
          <div class="space-y-1">
            ${(q.options||[]).map((opt,i)=>`
              <div class="flex gap-2 items-center">
                <input type="text" class="flex-1 px-2 py-1 border rounded" value="${opt.text||''}" onchange="window.updateOptionText(${idx},${i},this.value)">
                <label><input type="radio" name="correct${idx}" ${opt.isCorrect?'checked':''} onchange="window.setCorrectOption(${idx},${i})"> صحيح</label>
                <button type="button" class="text-red-500" onclick="window.removeOption(${idx},${i})"><i class="fas fa-times"></i></button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="mt-1 px-2 py-1 bg-gray-200 rounded" onclick="window.addOption(${idx})">إضافة خيار</button>
        </div>
        <div class="mb-2" style="display:${q.type==='صح وخطأ'?'block':'none'}">
          <label>الإجابة الصحيحة:</label>
          <select class="ml-2 px-2 py-1 border rounded" onchange="window.setTrueFalse(${idx},this.value)">
            <option value="true" ${q.correctAnswer===true?'selected':''}>صح</option>
            <option value="false" ${q.correctAnswer===false?'selected':''}>خطأ</option>
          </select>
        </div>
        <div class="mb-2">
          <label>شرح الإجابة (اختياري)</label>
          <input type="text" class="w-full px-2 py-1 border rounded" value="${q.explanation||''}" onchange="window.updateExplanation(${idx},this.value)">
        </div>
        <div class="mb-2">
          <label>النقاط</label>
          <input type="number" min="1" max="10" class="w-24 px-2 py-1 border rounded" value="${q.points||1}" onchange="window.updatePoints(${idx},this.value)">
        </div>
      `;
      qDiv.classList.add('question-block');
      questionsList.appendChild(qDiv);
    });
  }

  // Window helpers for dynamic events
  window.updateQuestionText = (idx, val) => { questions[idx].questionText = val; renderQuestions(); };
  window.updateQuestionType = (idx, val) => { questions[idx].type = val; if(val==='اختر من متعدد'){questions[idx].options=[{text:'',isCorrect:true},{text:'',isCorrect:false}];} else {questions[idx].options=[];questions[idx].correctAnswer=true;} renderQuestions(); };
  window.updateOptionText = (qIdx, oIdx, val) => { questions[qIdx].options[oIdx].text = val; renderQuestions(); };
  window.setCorrectOption = (qIdx, oIdx) => { questions[qIdx].options.forEach((o,i)=>o.isCorrect=i===oIdx); renderQuestions(); };
  window.addOption = (qIdx) => { questions[qIdx].options.push({text:'',isCorrect:false}); renderQuestions(); };
  window.removeOption = (qIdx, oIdx) => { questions[qIdx].options.splice(oIdx,1); renderQuestions(); };
  window.setTrueFalse = (idx, val) => { questions[idx].correctAnswer = (val==='true'); renderQuestions(); };
  window.updateExplanation = (idx, val) => { questions[idx].explanation = val; renderQuestions(); };
  window.updatePoints = (idx, val) => { questions[idx].points = parseInt(val)||1; renderQuestions(); };
  window.removeQuestion = (idx) => { questions.splice(idx,1); renderQuestions(); };

  addQuestionBtn.addEventListener('click', function() {
    questions.push({
      questionText: '',
      type: 'صح وخطأ',
      correctAnswer: true,
      explanation: '',
      points: 1,
      options: []
    });
    renderQuestions();
  });

  quizForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    quizMsg.textContent = '';
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();
    const grade = document.getElementById('quizGrade').value;
    const subject = document.getElementById('quizSubject').value.trim();
    const timeLimit = parseInt(document.getElementById('quizTimeLimit').value)||30;
    const isActive = document.getElementById('quizIsActive').value === 'true';
    if (!title || !grade || !subject || questions.length === 0) {
      quizMsg.textContent = 'يرجى ملء جميع الحقول وإضافة سؤال واحد على الأقل';
      quizMsg.className = 'text-red-600 font-bold';
      return;
    }
    // Prepare payload
    const payload = {
      title, description, grade, subject, timeLimit, isActive, questions
    };
    try {
      const token = localStorage.getItem('authToken') || '';
      const resp = await fetch('https://courses-j9010ueb3-mohameds-projects-b68e5f4b.vercel.app/api/quizzes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        quizMsg.textContent = 'تم إنشاء الكويز بنجاح!';
        quizMsg.className = 'text-green-600 font-bold';
        quizForm.reset();
        questions = [];
        renderQuestions();
      } else {
        quizMsg.textContent = data.message || 'فشل في إنشاء الكويز';
        quizMsg.className = 'text-red-600 font-bold';
      }
    } catch (e) {
      quizMsg.textContent = 'خطأ في الاتصال بالخادم';
      quizMsg.className = 'text-red-600 font-bold';
    }
  });

  // Start with one question by default
  questions.push({
    questionText: '',
    type: 'صح وخطأ',
    correctAnswer: true,
    explanation: '',
    points: 1,
    options: []
  });
  renderQuestions();
});
