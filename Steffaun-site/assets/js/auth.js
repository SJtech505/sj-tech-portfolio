(() => {
  const SESSION_KEY = "sjtech_session_v1";
  const USERS_KEY = "sjtech_users_v1";

  const $ = (id) => document.getElementById(id);

  function toast(text, type="good"){
  const t = document.getElementById("toast");
  if(!t) return;
  t.hidden = false;
  t.className = `toast ${type}`;
  t.textContent = text;
  clearTimeout(window.__sj_toast);
  window.__sj_toast = setTimeout(() => { t.hidden = true; }, 2200);
}


  function getUsers(){
    try{ return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
    catch{ return []; }
  }
  function saveUsers(users){
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
  function setSession(session){
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  function getSession(){
    try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch{ return null; }
  }
  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
  }

  function emailOk(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function passwordScore(pw){
    pw = String(pw || "");
    let score = 0;
    if (pw.length >= 8) score += 25;
    if (/[A-Z]/.test(pw)) score += 20;
    if (/[a-z]/.test(pw)) score += 20;
    if (/\d/.test(pw)) score += 20;
    if (/[^A-Za-z0-9]/.test(pw)) score += 15;
    return Math.min(100, score);
  }

  function requireAuth(){
    const s = getSession();
    if (!s || !s.email){
      window.location.href = "login.html";
    }
  }

  // ===== Register =====
  if ($("registerForm")){
    const form = $("registerForm");
    const msg = $("regMsg");
    const pw = $("regPassword");
    const bar = $("pwBar");
    const scoreText = $("pwScore");

    pw.addEventListener("input", () => {
      const score = passwordScore(pw.value);
      bar.style.width = `${score}%`;
      scoreText.textContent =
        score >= 80 ? "Strong" :
        score >= 55 ? "Good" :
        score >= 35 ? "Okay" : "Weak";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.className = "notice bad";
      msg.textContent = "";

      const name = $("regName").value.trim();
      const email = $("regEmail").value.trim().toLowerCase();
      const pass = pw.value;

      if (!name){ msg.textContent = "Enter your name."; return; }
      if (!emailOk(email)){ msg.textContent = "Enter a valid email."; return; }
      if (passwordScore(pass) < 55){ msg.textContent = "Use a stronger password (aim for Good/Strong)."; return; }

      const users = getUsers();
      if (users.some(u => u.email === email)){
        msg.textContent = "That email is already registered. Try logging in.";
        return;
      }

      users.push({ name, email, pass });
      saveUsers(users);

      msg.className = "notice good";
      msg.textContent = "Account created ✓ Redirecting to login…";
      toast("Account created ✓", "good");
      setTimeout(() => window.location.href = "login.html", 900);
    });
  }

  // ===== Login =====
  if ($("loginForm")){
    const form = $("loginForm");
    const msg = $("loginMsg");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.className = "notice bad";
      msg.textContent = "";

      const email = $("loginEmail").value.trim().toLowerCase();
      const pass = $("loginPassword").value;
      const remember = $("remember").checked;

      if (!emailOk(email)){ msg.textContent = "Enter a valid email."; return; }
      if (!pass){ msg.textContent = "Enter your password."; return; }

      const users = getUsers();
      const user = users.find(u => u.email === email && u.pass === pass);

      if (!user){
        msg.textContent = "Incorrect email or password.";
        toast("Incorrect email or password.", "bad");
        return;
      }

      setSession({ email: user.email, name: user.name, remember, at: Date.now() });
      msg.className = "notice good";
      msg.textContent = "Signed in ✓ Redirecting…";
      toast("Signed in ✓", "good");
      setTimeout(() => window.location.href = "dashboard.html", 650);
    });
  }

  // ===== Forgot =====
  if ($("forgotForm")){
    const form = $("forgotForm");
    const msg = $("forgotMsg");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("forgotEmail").value.trim().toLowerCase();
      msg.className = "notice";

      if (!emailOk(email)){
        msg.className = "notice bad";
        msg.textContent = "Enter a valid email.";
        return;
      }

      msg.className = "notice good";
      msg.textContent = "If this were live, a reset link would be sent. (Demo UI)";
    });
  }

  // ===== Dashboard =====
  if (document.body.dataset.page === "dashboard"){
    requireAuth();

    const s = getSession();
    $("who").textContent = s?.name || "User";
    $("whoEmail").textContent = s?.email || "";

    $("logoutBtn").addEventListener("click", () => {
      clearSession();
      window.location.href = "login.html";
    });

    // Demo activity
    const rows = [
      ["Signed in", new Date().toLocaleString(), "OK"],
      ["Viewed: Projects", "—", "OK"],
      ["Updated profile (demo)", "—", "OK"],
    ];

    const tbody = $("activityBody");
    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
      tbody.appendChild(tr);
    });
  }
})();
