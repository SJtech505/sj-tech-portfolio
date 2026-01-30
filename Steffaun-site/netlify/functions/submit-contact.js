exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { name, email, topic, message, page, user_agent } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing server env vars" }) };
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/contact_messages`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ name, email, topic, message, page, user_agent })
    });

    if (!res.ok) {
      const errText = await res.text();
      return { statusCode: 500, body: JSON.stringify({ error: "Supabase insert failed", details: errText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", details: String(e) }) };
  }
};
