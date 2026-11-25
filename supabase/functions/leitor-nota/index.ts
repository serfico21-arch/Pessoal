// Leitor de notas (celular -> gestor) do Mercado Pinheiro & Costa.
// O gestor cria um código secreto de pareamento (par) e mostra num QR; o celular lê o QR uma vez.
// - acao "enviar": o celular manda a chave da nota ou o link do QR do cupom.
// - acao "pegar": o gestor busca o que chegou para ele e marca como lido.
// (A SEFAZ-SP recusa consultas vindas de servidor, por isso os itens do cupom continuam
//  sendo lidos no computador.)
// Publicada no Supabase (projeto "variaveis") como "leitor-nota", verify_jwt = false.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const LOJA = "pinheiro-costa";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const UF: Record<string, string> = { "11":"RO","12":"AC","13":"AM","14":"RR","15":"PA","16":"AP","17":"TO","21":"MA","22":"PI","23":"CE","24":"RN","25":"PB","26":"PE","27":"AL","28":"SE","29":"BA","31":"MG","32":"ES","33":"RJ","35":"SP","41":"PR","42":"SC","43":"RS","50":"MS","51":"MT","52":"GO","53":"DF" };
function dv(c43: string) { let s = 0, p = 2; for (let i = c43.length - 1; i >= 0; i--) { s += Number(c43[i]) * p; p = p === 9 ? 2 : p + 1; } const r = s % 11; return r < 2 ? 0 : 11 - r; }
function chaveOk(c: string) { return /^\d{44}$/.test(c) && dv(c.slice(0, 43)) === Number(c[43]) && !!UF[c.slice(0, 2)]; }
function chaveDe(conteudo: string): string | null {
  const m = conteudo.match(/[?&]p=([^&|]+)/i);
  if (m) { const c = decodeURIComponent(m[1]).replace(/\D/g, "").slice(0, 44); if (chaveOk(c)) return c; }
  const so = conteudo.replace(/\D/g, "");
  return so.length === 44 && chaveOk(so) ? so : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false }, 405);
  let b: { acao?: string; par?: string; conteudo?: string };
  try { b = await req.json(); } catch { return json({ ok: false, erro: "pedido" }, 400); }
  const par = String(b.par || "");
  if (!/^[A-Za-z0-9]{24,64}$/.test(par)) return json({ ok: false, erro: "par" }, 400);
  const prefixo = `{"par":"${par}",`;

  if (b.acao === "enviar") {
    const conteudo = String(b.conteudo || "").trim().slice(0, 1500);
    const chave = chaveDe(conteudo);
    if (!chave) return json({ ok: false, erro: "nao-e-nota" });
    const { count } = await sb.from("mercado_leituras").select("id", { count: "exact", head: true })
      .like("conteudo", prefixo + "%").gt("criado_em", new Date(Date.now() - 60000).toISOString());
    if ((count || 0) > 30) return json({ ok: false, erro: "muitos" });
    const reg = JSON.stringify({ par, conteudo, chave, dados: null });
    const { error } = await sb.from("mercado_leituras").insert({ slug: LOJA, conteudo: reg });
    if (error) return json({ ok: false, erro: "banco" }, 500);
    await sb.from("mercado_leituras").delete().lt("criado_em", new Date(Date.now() - 7 * 864e5).toISOString());
    return json({ ok: true, modelo: chave.slice(20, 22), numero: String(Number(chave.slice(25, 34))) });
  }

  if (b.acao === "pegar") {
    const { data, error } = await sb.from("mercado_leituras").select("id, criado_em, conteudo")
      .eq("slug", LOJA).eq("lido", false).like("conteudo", prefixo + "%")
      .gt("criado_em", new Date(Date.now() - 864e5).toISOString()).order("criado_em").limit(20);
    if (error) return json({ ok: false, erro: "banco" }, 500);
    const ids = (data || []).map((x) => x.id);
    if (ids.length) await sb.from("mercado_leituras").update({ lido: true }).in("id", ids);
    const lista = (data || []).map((x) => { try { const o = JSON.parse(x.conteudo); return { conteudo: o.conteudo, chave: o.chave, dados: o.dados }; } catch { return null; } }).filter(Boolean);
    return json({ ok: true, lista });
  }
  return json({ ok: false, erro: "acao" }, 400);
});
