// COUNTRY API
document.getElementById("countryBtn").addEventListener("click", async () => {
  const country = document.getElementById("countryInput").value;
  const resultBox = document.getElementById("countryResult");
  resultBox.innerHTML = `<div class="loader"></div>`;


  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${country}`);
    const data = await res.json();
    const c = data[0];

    resultBox.innerHTML = `
  <img src="${c.flags.png}" style="width:40px;border-radius:6px"><br>
  <strong>${c.name.common}</strong><br>
  Capital: ${c.capital?.[0]}<br>
  Population: ${c.population.toLocaleString()}<br>
  Region: ${c.region}
`;

  } catch {
    resultBox.textContent = "Country not found.";
  }
});

// WEATHER API (Open-Meteo: no key)
document.getElementById("weatherBtn").addEventListener("click", async () => {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");

  if (!city){
    resultBox.textContent = "Type a city name first.";
    return;
  }

  resultBox.textContent = "Loading...";

  try {
    // 1) Geocode city -> lat/lon
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) throw new Error("Geocoding failed");
    const geo = await geoRes.json();

    if (!geo.results || geo.results.length === 0){
      resultBox.textContent = "City not found.";
      return;
    }

    const place = geo.results[0];
    const lat = place.latitude;
    const lon = place.longitude;

    // 2) Current weather
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    if (!wRes.ok) throw new Error("Weather fetch failed");
    const wData = await wRes.json();

    const w = wData.current_weather;
    if (!w){
      resultBox.textContent = "Weather unavailable right now.";
      return;
    }

    resultBox.innerHTML = `
      <strong>${place.name}${place.country ? ", " + place.country : ""}</strong><br>
      Temp: ${w.temperature}°C<br>
      Wind: ${w.windspeed} km/h<br>
      Time: ${w.time}
    `;
  } catch (err) {
    console.log(err);
    resultBox.textContent = "Weather unavailable. Try again in a moment.";
  }
});
window.addEventListener("load", () => {
  document.getElementById("countryInput").value = "Jamaica";
  document.getElementById("countryBtn").click();

  document.getElementById("cityInput").value = "Kingston";
  document.getElementById("weatherBtn").click();
});
