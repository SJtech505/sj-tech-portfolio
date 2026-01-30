(() => {
  const form = document.getElementById("briefForm");
  const steps = Array.from(document.querySelectorAll(".step"));
  const stepLabel = document.getElementById("stepLabel");
  const statusLabel = document.getElementById("statusLabel");

  const summaryBox = document.getElementById("summaryBox");
  const summaryHint = document.getElementById("summaryHint");
  const copyBtn = document.getElementById("copyBtn");
  const resetBtn = document.getElementById("resetBtn");
  const copyStatus = document.getElementById("copyStatus");
  const progressBar = document.getElementById("progressBar");


  const STORAGE_KEY = "sjtech_brief_v1";
  let currentStep = 1;

  const inputs = Array.from(form.querySelectorAll("input, textarea"));

  function showStep(n){
    progressBar.style.width = (n * 33) + "%";
    currentStep = n;
    steps.forEach(s => s.hidden = s.dataset.step !== String(n));
    stepLabel.textContent = `Step ${n} of 3`;
  }

  function getData(){
    const data = {};
    inputs.forEach(el => data[el.name] = (el.value || "").trim());
    return data;
  }

  function setData(data){
    inputs.forEach(el => {
      if (data && Object.prototype.hasOwnProperty.call(data, el.name)) {
        el.value = data[el.name];
      }
    });
  }

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getData()));
    statusLabel.textContent = "autosave: saved";
    setTimeout(() => statusLabel.textContent = "autosave: on", 700);
  }

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      setData(JSON.parse(raw));
    }catch(e){}
  }

  function requiredOk(stepNum){
    const step = steps.find(s => s.dataset.step === String(stepNum));
    const required = Array.from(step.querySelectorAll("[required]"));
    for (const el of required){
      if (!el.value.trim()){
        el.focus();
        return false;
      }
      if (el.type === "email"){
        // basic email sanity check
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if(!ok){ el.focus(); return false; }
      }
    }
    return true;
  }

  function makeSummary(data){
    const lines = [
      "SJ TECH — PROJECT BRIEF",
      "-----------------------",
      `Name: ${data.name || "-"}`,
      `Email: ${data.email || "-"}`,
      "",
      `Project Type: ${data.type || "-"}`,
      `Main Goal: ${data.goal || "-"}`,
      `Pages Needed: ${data.pages || "-"}`,
      `Features: ${data.features || "-"}`,
      "",
      `Style/Vibe: ${data.style || "-"}`,
      `Deadline: ${data.deadline || "-"}`,
      "",
      "Extra Notes:",
      data.notes || "-",
      "",
      "Sent via SJ Tech Brief Tool"
    ];
    return lines.join("\n");
  }

  // nav buttons
  document.getElementById("next1").addEventListener("click", () => {
    if(!requiredOk(1)) return;
    showStep(2);
  });
  document.getElementById("back2").addEventListener("click", () => showStep(1));
  document.getElementById("next2").addEventListener("click", () => {
    if(!requiredOk(2)) return;
    showStep(3);
  });
  document.getElementById("back3").addEventListener("click", () => showStep(2));

  // autosave
  inputs.forEach(el => {
    el.addEventListener("input", () => save());
    el.addEventListener("change", () => save());
  });

  // generate summary
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if(!requiredOk(3)) return;

    const data = getData();
    const summary = makeSummary(data);

    summaryHint.textContent = "Your brief is ready. Copy and send it.";
    summaryBox.value = summary;
    copyStatus.textContent = "";
  });

  // copy summary
  copyBtn.addEventListener("click", async () => {
    const text = summaryBox.value.trim();
    if(!text){
      copyStatus.textContent = "Nothing to copy yet — generate the summary first.";
      return;
    }
    try{
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Copied ✓";
    }catch(e){
      // fallback
      summaryBox.focus();
      summaryBox.select();
      copyStatus.textContent = "Copy not supported here — I highlighted the text.";
    }
  });

const emailBtn = document.getElementById("emailBtn");

emailBtn.addEventListener("click", () => {
  const text = summaryBox.value.trim();
  if(!text) return;
  const subject = encodeURIComponent("New Project Brief for SJ Tech");
  const body = encodeURIComponent(text);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});


  // reset
  resetBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    summaryBox.value = "";
    summaryHint.textContent = "Fill the form, then click “Generate Summary”.";
    copyStatus.textContent = "";
    showStep(1);
    statusLabel.textContent = "autosave: cleared";
    setTimeout(() => statusLabel.textContent = "autosave: on", 800);
  });

  // init
  load();
  showStep(1);
})();
