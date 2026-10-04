import { createClient } from "@supabase/supabase-js";

// Preflight CORS handler for external webhook calls
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-webhook-secret, Authorization",
    },
  });
}

// EMQX Cloud HTTP action → sensor_logs. Payload: { tma, moisture, risk_index }.
export async function POST(request: Request) {
  // Set the same value as a custom header in the EMQX HTTP action.
  const secret = process.env.WEBHOOK_SECRET;
  if (secret && request.headers.get("x-webhook-secret") !== secret) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const text = await request.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    console.warn("webhook rejected, invalid JSON:", text);
    return Response.json({ success: false, error: "Invalid JSON body", received: text }, { status: 400 });
  }

  // Dukung payload langsung { tma, moisture, risk_index } maupun jika dibungkus { payload: { ... } } atau { data: { ... } }
  const data =
    (body?.payload && typeof body.payload === "object" ? body.payload : null) ||
    (body?.data && typeof body.data === "object" ? body.data : null) ||
    (body ?? {});

  const tma = Number(data?.tma);
  const moisture = Number(data?.moisture);
  const risk_index = Number(data?.risk_index);

  if (![tma, moisture, risk_index].every(Number.isFinite)) {
    console.warn("webhook rejected, bad fields:", text);
    return Response.json(
      { success: false, error: "tma, moisture and risk_index must be valid numbers", received: body },
      { status: 400 }
    );
  }

  try {
    // Created per request so a missing env var surfaces as a 500 instead of breaking the build.
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    const { error } = await supabase
      .from("sensor_logs")
      .insert({ tma, moisture, risk_index, created_at: new Date().toISOString() });
    if (error) throw error;

    console.log("webhook saved:", text);
    return Response.json({ success: true });
  } catch (err) {
    console.error("sensor_logs insert failed:", err);
    return Response.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
