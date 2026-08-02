export async function onRequest({ request, env }) {
  if (request.method === "POST") {
    const total = await incrementTotal(env);
    const kiriban = isKiriban(total) ? total : null;
    return json({ total, kiriban });
  }
  if (request.method === "GET") {
    const total = await readTotal(env);
    return json({ total });
  }
  return new Response(null, { status: 405, headers: { allow: "GET, POST" } });
}

async function readTotal(env) {
  if (!env.KIRIBAN) return null;
  const value = await env.KIRIBAN.get("total");
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

async function incrementTotal(env) {
  if (!env.KIRIBAN) return null;
  const current = await readTotal(env);
  const next = current + 1;
  await env.KIRIBAN.put("total", String(next));
  return next;
}

function isKiriban(value) {
  if (!Number.isFinite(value) || value < 100) return false;
  const text = String(value);
  if (/^(\d)\1+$/.test(text)) return true;
  if (value % 1000 === 0 || value % 500 === 0 || value % 100 === 0) return true;
  return false;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}
