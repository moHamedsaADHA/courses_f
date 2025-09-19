// lessons.js - إدارة الحصص ديناميكياً عبر API
// يعتمد على window.AUTH

(function(){
  const API_BASE = (window.AUTH && window.AUTH.CONFIG && window.AUTH.CONFIG.API_BASE_URL) || 'https://courses-pj.vercel.app/api';
  const ENDPOINT = API_BASE + '/lessons';

  // Wait for user to become available (in case auth.js still initializing or session restored async)
  function whenUserReady(maxWaitMs = 4000){
    return new Promise(resolve => {
      const started = Date.now();
      function check(){
        const user = window.AUTH && window.AUTH.getCurrentUser ? window.AUTH.getCurrentUser() : null;
        if(user){ return resolve(user); }
        if(Date.now() - started > maxWaitMs){ return resolve(null); }
        setTimeout(check, 120);
      }
      check();
    });
  }

  function authHeaders(){
    const token = window.AUTH && window.AUTH.getAuthToken ? window.AUTH.getAuthToken() : null;
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  async function apiRequest(url, options={}){
    const final = {
      ...options,
      headers: {
        'Content-Type':'application/json',
        ...authHeaders(),
        ...(options.headers||{})
      }
    };
    const res = await fetch(url, final);
    let body;
    try { body = await res.json(); } catch(_){ body = {}; }
    if(!res.ok) throw { status: res.status, body };
    return body;
  }

  // ========== CRUD ==========
  async function listLessons({grade, unit, search, page=1, limit=20}={}){
    const params = new URLSearchParams();
    if(grade) params.append('grade', grade);
    if(unit) params.append('unit', unit);
    if(search) params.append('search', search);
    params.append('page', page);
    params.append('limit', limit);
    return apiRequest(ENDPOINT + '?' + params.toString());
  }

  async function getLesson(id){
    return apiRequest(`${ENDPOINT}/${id}`);
  }

  async function createLesson(data){
    const payload = { ...data };
    try {
      if(!payload.createdBy){
        const user = (window.AUTH && window.AUTH.getCurrentUser) ? window.AUTH.getCurrentUser() : null;
        if(user){
          payload.createdBy = user._id || user.id || user.userId; // دعم أكثر من شكل
        }
      }
    } catch(_e) {}
    return apiRequest(ENDPOINT, {
      method:'POST',
      body: JSON.stringify(payload)
    });
  }

  async function updateLesson(id, data){
    return apiRequest(`${ENDPOINT}/${id}`, {
      method:'PUT',
      body: JSON.stringify(data)
    });
  }

  async function deleteLesson(id){
    return apiRequest(`${ENDPOINT}/${id}`, { method:'DELETE' });
  }

  // ========== UI HELPERS ==========
  function embedVideo(url){
    if(!url) return '';
    // YouTube
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
    if(yt) return `<iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`;
    // Vimeo
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if(vimeo) return `<iframe class="w-full aspect-video rounded-xl" src="https://player.vimeo.com/video/${vimeo[1]}" allowfullscreen></iframe>`;
    // Direct mp4
    if(/\.mp4($|\?)/.test(url)) return `<video class="w-full rounded-xl" controls src="${url}"></video>`;
    // Fallback link
    return `<a class="text-blue-600 underline" href="${url}" target="_blank">مشاهدة الفيديو</a>`;
  }

  let __cachedUser = null;
  document.addEventListener('auth:user-ready', e=>{ __cachedUser = e.detail.user; });
  document.addEventListener('auth:ready', ()=>{ if(window.AUTH && window.AUTH.getCurrentUser){ __cachedUser = window.AUTH.getCurrentUser(); }});

  function resolveUser(){
    if(window.AUTH && window.AUTH.getCurrentUser){
      const u = window.AUTH.getCurrentUser();
      if(u) { __cachedUser = u; return u; }
    }
    return __cachedUser;
  }

  function canManage(){
    const user = resolveUser();
    if(!user){ console.log('[LessonsAPI] no user found for canManage'); return false; }
    const roleRaw = (user.role || '').trim().toLowerCase();
    // دعم أدوار عربية أو مشتقات محتملة
    const allowed = ['instructor','admin','teacher','مدرس','معلم'];
    const can = allowed.includes(roleRaw);
    console.log('[LessonsAPI] canManage? role=', roleRaw, '=>', can);
    return can;
  }

  window.LessonsAPI = {
    listLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    embedVideo,
    canManage,
    whenUserReady
  };

  console.log('📘 LessonsAPI loaded');

  // Dispatch custom event once user becomes available (for pages to rebuild toolbars if they rendered early)
  whenUserReady().then(u => {
    if(u){
      __cachedUser = u;
      document.dispatchEvent(new CustomEvent('auth:user-ready', { detail: { user: u }}));
    }
  });
})();
