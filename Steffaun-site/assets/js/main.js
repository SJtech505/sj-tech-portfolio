// Highlight active nav link + set year
(() => {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();


// ===== Scroll reveal (fade-in) =====
(() => {
  const els = document.querySelectorAll(".card, .sectionTitle, .hero, .footerRow");
  els.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  els.forEach(el => io.observe(el));
})();
