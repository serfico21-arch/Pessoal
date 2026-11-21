// Cópia da Edge Function "push-pedido" (Supabase, verify_jwt = false). Sem segredos: as chaves vêm do banco.
// R-17: manda notificação para o celular do dono quando entra um pedido (e repete até o barbeiro parar).
// Não confia no corpo da chamada: o banco decide o que enviar (push_dados).
import webpush from "npm:web-push@3.6.7";

const URL_BASE = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function rpc(fn: string, body: unknown) {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const t = await r.text();
  if (!r.ok) throw new Error(fn + " " + r.status + " " + t);
  return t ? JSON.parse(t) : null;
}

// ATENÇÃO: nomes fixos da R-17. Para várias barbearias, trocar por nome vindo do banco.
const NOMES: Record<string, string> = { ro: "Rô", joao: "João" };
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
function fmtDia(iso: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${DIAS[dt.getUTCDay()]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async () => {
  try {
    const d = await rpc("push_dados", {});
    if (!d || !d.pub || !d.priv || !d.itens?.length) return json({ enviados: 0 });
    webpush.setVapidDetails("mailto:avisos@r17.app", d.pub, d.priv);
    let ok = 0;
    for (const it of d.itens) {
      const partes = [fmtDia(it.dia), it.periodo, it.barbeiro ? "com " + (NOMES[it.barbeiro] || it.barbeiro) : ""].filter(Boolean).join(" · ");
      const payload = JSON.stringify({
        title: "🚨 PEDIDO NOVO: " + it.nome,
        body: (partes ? partes + "\n" : "") + "Toque para abrir o painel e parar o alarme.",
        tag: "pedido-" + it.id,
      });
      try {
        await webpush.sendNotification(it.sub, payload, { TTL: 300, urgency: "high" });
        ok++;
      } catch (e) {
        const sc = (e as { statusCode?: number }).statusCode;
        if (sc === 404 || sc === 410) await rpc("push_remover", { p_endpoint: it.sub.endpoint }).catch(() => {});
      }
    }
    return json({ enviados: ok });
  } catch (e) {
    return json({ erro: String(e) }, 500);
  }
});
