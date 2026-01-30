(() => {
  const pwEl = document.getElementById("pw");
  const showEl = document.getElementById("showPw");
  const genBtn = document.getElementById("genBtn");
  const copyBtn = document.getElementById("copyBtn");

  const bar = document.getElementById("bar");
  const ratingEl = document.getElementById("rating");
  const entropyEl = document.getElementById("entropy");
  const lengthBadge = document.getElementById("lengthBadge");
  const checksEl = document.getElementById("checks");
  const copyStatus = document.getElementById("copyStatus");

  const commonBad = new Set([
    "password","123456","123456789","qwerty","111111","abc123","iloveyou",
    "admin","welcome","letmein","monkey","dragon","football"
  ]);

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  // rough estimate: based on character pool size and length
  function estimateEntropy(pw){
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/\d/.test(pw)) pool += 10;
    if (/[^A-Za-z0-9]/.test(pw)) pool += 32; // rough symbol set
    if (pool === 0) return 0;

    // entropy ≈ L * log2(pool)
    const L = pw.length;
    return L * (Math.log(pool) / Math.log(2));
  }

  function classify(entropy, len){
    // friendly bands
    if (len === 0) return { label: "—", pct: 0 };
    if (entropy < 28) return { label: "Weak", pct: 25 };
    if (entropy < 45) return { label: "Okay", pct: 50 };
    if (entropy < 65) return { label: "Good", pct: 75 };
    return { label: "Strong", pct: 100 };
  }

  function hasRepeatRuns(pw){
    // detect "aaa" or "111" type sequences
    return /(.)\1\1/.test(pw);
  }

  function buildChecks(pw){
    const lower = pw.toLowerCase().trim();

    const checks = [
      { ok: pw.length >= 12, text: "12+ characters (recommended)" },
      { ok: /[a-z]/.test(pw), text: "Has lowercase letter" },
      { ok: /[A-Z]/.test(pw), text: "Has uppercase letter" },
      { ok: /\d/.test(pw), text: "Has a number" },
      { ok: /[^A-Za-z0-9]/.test(pw), text: "Has a symbol" },
      { ok: !commonBad.has(lower), text: "Not a common weak password" },
      { ok: !hasRepeatRuns(pw), text: "No obvious repeats (aaa / 111)" },
      { ok: !/(0123|1234|2345|3456|4567|5678|6789|abcd|qwerty)/i.test(pw), text: "Avoids easy sequences" },
    ];

    return checks;
  }

  function render(){
    const pw = pwEl.value || "";
    const len = pw.length;

    lengthBadge.textContent = `Length: ${len}`;

    const ent = estimateEntropy(pw);
    const entRounded = Math.round(ent);
    entropyEl.textContent = `Est. strength: ${len ? `${entRounded} bits` : "—"}`;

    const c = classify(ent, len);
    ratingEl.textContent = `Rating: ${c.label}`;

    bar.style.width = `${c.pct}%`;

    // checks list
    const checks = buildChecks(pw);
    checksEl.innerHTML = "";
    checks.forEach(item => {
      const li = document.createElement("li");
      li.className = item.ok ? "checkGood" : "checkBad";
      li.innerHTML = `<strong>${item.ok ? "✓" : "✗"}</strong> ${item.text}`;
      checksEl.appendChild(li);
    });

    // small hint
    if (len && commonBad.has(pw.toLowerCase().trim())){
      copyStatus.textContent = "That’s a very common password — avoid it.";
    } else {
      copyStatus.textContent = "";
    }
  }

  function randomPassword(){
    // avoids confusing chars by default? (optional)
    const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const nums = "23456789";
    const syms = "!@#$%^&*_-+=?";
    const all = letters + nums + syms;

    // 16 chars, guarantee variety
    let out = "";
    out += letters[Math.floor(Math.random() * letters.length)];
    out += letters[Math.floor(Math.random() * letters.length)];
    out += nums[Math.floor(Math.random() * nums.length)];
    out += syms[Math.floor(Math.random() * syms.length)];
    for (let i = 4; i < 16; i++){
      out += all[Math.floor(Math.random() * all.length)];
    }

    // shuffle
    out = out.split("").sort(() => Math.random() - 0.5).join("");
    return out;
  }

  showEl.addEventListener("change", () => {
    pwEl.type = showEl.checked ? "text" : "password";
  });

  pwEl.addEventListener("input", render);

  genBtn.addEventListener("click", () => {
    pwEl.value = randomPassword();
    render();
    pwEl.focus();
  });

  copyBtn.addEventListener("click", async () => {
    const text = (pwEl.value || "").trim();
    if (!text){
      copyStatus.textContent = "Nothing to copy yet.";
      return;
    }
    try{
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Copied ✓";
    }catch{
      pwEl.focus();
      pwEl.select();
      copyStatus.textContent = "Copy not supported here — text highlighted.";
    }
  });

  // init
  render();
})();
