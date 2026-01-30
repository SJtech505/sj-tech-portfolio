(() => {
  const qEl = document.getElementById("q");
  const parishEl = document.getElementById("parish");
  const categoryEl = document.getElementById("category");
  const onlyFavEl = document.getElementById("onlyFav");

  const resultsEl = document.getElementById("results");
  const emptyStateEl = document.getElementById("emptyState");
  const subtitleEl = document.getElementById("subtitle");

  const countBadge = document.getElementById("countBadge");
  const favBadge = document.getElementById("favBadge");

  const resetBtn = document.getElementById("resetBtn");
  const sortBtn = document.getElementById("sortBtn");
  const seedBtn = document.getElementById("seedBtn");

  const FAV_KEY = "sjtech_yaadhelp_favs_v1";
  const STATE_KEY = "sjtech_yaadhelp_state_v1";

  let sortAZ = true;

  // Sample dataset (you can expand anytime)
  const providers = [
    { id:"p1", name:"Portmore Auto Rescue", category:"Tow Truck", parish:"St. Catherine", phone:"(876) 555-0101", verified:true },
    { id:"p2", name:"Kingston QuickFix Plumbing", category:"Plumber", parish:"Kingston", phone:"(876) 555-0102", verified:false },
    { id:"p3", name:"Montego Bay Spark Electric", category:"Electrician", parish:"St. James", phone:"(876) 555-0103", verified:true },
    { id:"p4", name:"Neon Nails Studio", category:"Nail Tech", parish:"Kingston", phone:"(876) 555-0104", verified:true },
    { id:"p5", name:"Spanish Town Pro Mechanics", category:"Mechanic", parish:"St. Catherine", phone:"(876) 555-0105", verified:false },
    { id:"p6", name:"Ochi Hair Lounge", category:"Hairdresser", parish:"St. Ann", phone:"(876) 555-0106", verified:true },
    { id:"p7", name:"May Pen Pipe & Drain", category:"Plumber", parish:"Clarendon", phone:"(876) 555-0107", verified:true },
    { id:"p8", name:"Mandeville Tow & Go", category:"Tow Truck", parish:"Manchester", phone:"(876) 555-0108", verified:false },
    { id:"p9", name:"Savanna-la-Mar Home Electric", category:"Electrician", parish:"Westmoreland", phone:"(876) 555-0109", verified:false },
    { id:"p10", name:"Half Way Tree Glam Nails", category:"Nail Tech", parish:"Kingston", phone:"(876) 555-0110", verified:true },
  ];

  const allParishes = [
    "Kingston","St. Andrew","St. Catherine","Clarendon","Manchester","St. Ann","St. James",
    "Westmoreland","Hanover","Trelawny","St. Mary","Portland","St. Thomas","St. Elizabeth"
  ];

  const allCategories = ["Mechanic","Tow Truck","Plumber","Electrician","Nail Tech","Hairdresser"];

  function loadFavs(){
    try{ return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); }
    catch{ return new Set(); }
  }
  function saveFavs(set){
    localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set)));
  }

  function saveState(){
    const state = {
      q: qEl.value || "",
      parish: parishEl.value || "all",
      category: categoryEl.value || "all",
      onlyFav: !!onlyFavEl.checked,
      sortAZ
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }
  function loadState(){
    try{
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
      if (typeof s.q === "string") qEl.value = s.q;
      if (typeof s.parish === "string") parishEl.value = s.parish;
      if (typeof s.category === "string") categoryEl.value = s.category;
      if (typeof s.onlyFav === "boolean") onlyFavEl.checked = s.onlyFav;
      if (typeof s.sortAZ === "boolean") sortAZ = s.sortAZ;
    }catch{}
  }

  function populateSelect(el, items){
    items.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      el.appendChild(opt);
    });
  }

  function norm(s){ return (s || "").toLowerCase().trim(); }

  function currentSubtitle(){
    const p = parishEl.value === "all" ? "All parishes" : parishEl.value;
    const c = categoryEl.value === "all" ? "All categories" : categoryEl.value;
    const q = qEl.value.trim();
    const fav = onlyFavEl.checked ? " • Favorites only" : "";
    return `${p} • ${c}${q ? ` • Search: “${q}”` : ""}${fav}`;
  }

  function render(){
    const favs = loadFavs();
    favBadge.textContent = `${favs.size} favorites`;

    const q = norm(qEl.value);
    const parish = parishEl.value;
    const category = categoryEl.value;

    let list = providers.slice();

    if (parish !== "all") list = list.filter(x => x.parish === parish);
    if (category !== "all") list = list.filter(x => x.category === category);
    if (q) list = list.filter(x =>
      norm(x.name).includes(q) ||
      norm(x.category).includes(q) ||
      norm(x.parish).includes(q)
    );
    if (onlyFavEl.checked) list = list.filter(x => favs.has(x.id));

    list.sort((a,b) => {
      const A = a.name.localeCompare(b.name);
      return sortAZ ? A : -A;
    });

    subtitleEl.textContent = currentSubtitle();
    countBadge.textContent = `${list.length} results`;

    resultsEl.innerHTML = "";
    emptyStateEl.style.display = list.length ? "none" : "block";

    for (const x of list){
      const isFav = favs.has(x.id);
      const card = document.createElement("div");
      card.className = "resultCard";

      card.innerHTML = `
        <div class="resultTop">
          <div>
            <h4 class="resultName">${x.name}</h4>
            <p class="resultMeta">${x.category} • ${x.parish}${x.verified ? " • Verified" : ""}</p>
          </div>
          <button class="miniBtn star ${isFav ? "on" : ""}" data-fav="${x.id}" title="Toggle favorite" aria-label="Toggle favorite">
            ${isFav ? "★" : "☆"}
          </button>
        </div>

        <div class="krow">
          <span class="tagChip c">${x.category}</span>
          <span class="tagChip u">${x.parish}</span>
          <span class="tagChip ${x.verified ? "g" : "p"}">${x.verified ? "Verified" : "Unverified"}</span>
        </div>

        <div class="krow" style="margin-top:6px;">
          <button class="miniBtn" data-call="${x.phone}">Call</button>
          <button class="miniBtn" data-copy="${x.phone}">Copy #</button>
          <button class="miniBtn" data-details="${x.id}">Details</button>
        </div>
      `;

      resultsEl.appendChild(card);
    }

    saveState();
  }

  // events
  [qEl, parishEl, categoryEl, onlyFavEl].forEach(el => el.addEventListener("input", render));
  [parishEl, categoryEl, onlyFavEl].forEach(el => el.addEventListener("change", render));

  resetBtn.addEventListener("click", () => {
    qEl.value = "";
    parishEl.value = "all";
    categoryEl.value = "all";
    onlyFavEl.checked = false;
    sortAZ = true;
    sortBtn.textContent = "Sort: A → Z";
    localStorage.removeItem(STATE_KEY);
    render();
  });

  sortBtn.addEventListener("click", () => {
    sortAZ = !sortAZ;
    sortBtn.textContent = sortAZ ? "Sort: A → Z" : "Sort: Z → A";
    render();
  });

  seedBtn.addEventListener("click", () => {
    // just a user-friendly action to show this is “alive”
    qEl.focus();
    subtitleEl.textContent = "Sample dataset loaded. Try filters + favorites.";
  });

  resultsEl.addEventListener("click", async (e) => {
    const favBtn = e.target.closest("[data-fav]");
    const callBtn = e.target.closest("[data-call]");
    const copyBtn = e.target.closest("[data-copy]");
    const detailsBtn = e.target.closest("[data-details]");

    if (favBtn){
      const id = favBtn.getAttribute("data-fav");
      const favs = loadFavs();
      if (favs.has(id)) favs.delete(id);
      else favs.add(id);
      saveFavs(favs);
      render();
      return;
    }

    if (callBtn){
      const phone = callBtn.getAttribute("data-call");
      // On desktop, this may open a calling app if configured
      window.location.href = `tel:${phone.replace(/[^\d+]/g,"")}`;
      return;
    }

    if (copyBtn){
      const phone = copyBtn.getAttribute("data-copy");
      try{
        await navigator.clipboard.writeText(phone);
        subtitleEl.textContent = `Copied: ${phone}`;
      }catch{
        subtitleEl.textContent = `Copy not supported. Phone: ${phone}`;
      }
      return;
    }

    if (detailsBtn){
      const id = detailsBtn.getAttribute("data-details");
      const p = providers.find(x => x.id === id);
      if (p) alert(`${p.name}\n${p.category} • ${p.parish}\nPhone: ${p.phone}\n${p.verified ? "Verified provider" : "Unverified provider"}`);
      return;
    }
  });

  // init
  populateSelect(parishEl, allParishes);
  populateSelect(categoryEl, allCategories);
  loadState();
  sortBtn.textContent = sortAZ ? "Sort: A → Z" : "Sort: Z → A";
  render();
})();
