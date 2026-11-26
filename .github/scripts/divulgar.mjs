// ROBÔ DE DIVULGAÇÃO (roda no GitHub, a cada 5 minutos)
// 1) Lê os pedidos "DIVULGAR" no Firebase (fcosta_publicacoes, auto:true)
// 2) Para cada pedido novo: posta na Página do Facebook (post com fotos + story)
//    e no Instagram (carrossel + story)
// 3) Grava o resultado em divulgar/status.json (o Publicador mostra para o Sérgio)
// Não apaga nada no Firebase. Só lê.
import fs from "node:fs";

const DB = "https://fcosta2026-847c3-default-rtdb.firebaseio.com";
const SITE = "https://fcostacorretor.com";
const G = "https://graph.facebook.com/v23.0";
const ARQ = "divulgar/status.json";
const MAX_IDADE = 2 * 864e5; // pedidos com mais de 2 dias são ignorados

let cfg = {};
try { cfg = JSON.parse(process.env.META_CONFIG || "{}"); } catch { console.log("META_CONFIG inválido"); }
const temFB = !!(cfg.token && cfg.page), temTG = !!(cfg.tgToken && cfg.tgChat);
const conectado = temFB || temTG;

let st = { conectado: false, atualizado: "", itens: {} };
try { st = Object.assign(st, JSON.parse(fs.readFileSync(ARQ, "utf8"))); } catch {}
const antes = JSON.stringify(st);
st.conectado = conectado;
st.redes = { fb: temFB, ig: !!(temFB && cfg.ig), tg: temTG };

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
async function jget(u) { const r = await fetch(u); if (!r.ok) throw new Error("HTTP " + r.status + " " + u.split("?")[0]); return r.json(); }
async function gpost(path, params) {
  const body = new URLSearchParams(Object.assign({ access_token: cfg.token }, params));
  const r = await fetch(G + path, { method: "POST", body });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error((j.error && j.error.message) || "HTTP " + r.status);
  return j;
}
async function gget(path, params) {
  const q = new URLSearchParams(Object.assign({ access_token: cfg.token }, params || {}));
  const j = await jget(G + path + "?" + q);
  if (j.error) throw new Error(j.error.message);
  return j;
}

/* ---------- Dados do imóvel ---------- */
const arr = (v) => (Array.isArray(v) ? v : Object.values(v || {}));
function fotos(d) {
  const out = [];
  const add = (u) => { if (typeof u === "string" && /^https?:\/\/\S+$/.test(u) && !/\.(mp4|mov|webm|pdf)(\?|$)/i.test(u) && !out.includes(u)) out.push(u); };
  add(d.fotoDestaque); arr(d.fotos).forEach((f) => add(typeof f === "string" ? f : f && (f.url || f.src))); ["foto", "imagem", "capa"].forEach((k) => add(d[k]));
  return out;
}
// Instagram só aceita JPEG: o Cloudinary converte
const jpg = (u, w) => (u.includes("res.cloudinary.com") && u.includes("/upload/") ? u.replace("/upload/", "/upload/f_jpg,q_auto,w_" + w + "/") : u);
const story = (u) => (u.includes("res.cloudinary.com") && u.includes("/upload/") ? u.replace("/upload/", "/upload/f_jpg,q_auto,c_pad,b_auto,w_1080,h_1920/") : u);
function link(id, d, src) {
  const slug = String(d.slug || "").replace(/^\/+|\/+$/g, "");
  const u = /^[a-z0-9-]+$/i.test(slug) ? SITE + "/" + slug + "/" : SITE + "/imovel?id=" + encodeURIComponent(id);
  return u + (u.includes("?") ? "&" : "?") + "utm_source=" + src + "&utm_medium=organico&utm_campaign=" + encodeURIComponent(String(d.codigo || id).toLowerCase());
}
function money(p) { if (p === "" || p == null) return "Consulte"; if (typeof p === "number") return p.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }); p = String(p).trim(); return /^R\$/.test(p) ? p : "R$ " + p; }
function textos(id, d) {
  const st2 = d.status || "venda";
  const pr = money(d.preco) + (st2 === "aluguel" ? "/mês" : "");
  const onde = [d.bairro, d.cidade].filter(Boolean).join(" – ");
  const n = (v, a, b) => (+v ? +v + " " + (+v > 1 ? b : a) : "");
  const ft = [n(d.quartos, "quarto", "quartos"), n(d.banheiros, "banheiro", "banheiros"), n(d.vagas, "vaga", "vagas"), d.area ? d.area + (/m/i.test(String(d.area)) ? "" : " m²") : ""].filter(Boolean).join(" · ");
  const abre = (st2 === "aluguel" ? "🔑 PARA ALUGAR" : st2 === "lancamento" ? "🚀 LANÇAMENTO" : "🏡 À VENDA") + " – " + (d.titulo || "Imóvel");
  let desc = String(d.descricao || "").replace(/\s+/g, " ").trim(); if (desc.length > 600) desc = desc.slice(0, 600).replace(/\s\S*$/, "") + "…";
  const zap = "wa.me/" + (cfg.whats || "5511993509109");
  const assin = (cfg.nome || "Sérgio Costa") + " · " + (cfg.creci || "CRECI-SP 294791-F");
  const tag = (s) => "#" + String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const tags = ["#imoveis", st2 === "aluguel" ? "#aluguel" : "#imovelavenda", "#corretordeimoveis", "#casapropria"].concat(d.bairro ? [tag(d.bairro)] : [], d.cidade ? [tag(d.cidade)] : []);
  const fb = [abre, "", "📍 " + onde, "💰 " + pr, ft && "🛏️ " + ft, "", desc, "", "🔗 Fotos e detalhes: " + link(id, d, "facebook"), "", "💬 Chama no WhatsApp: " + zap, "", assin + (d.codigo ? " · Cód. " + d.codigo : "")].filter((x) => x !== false && x != null).join("\n").replace(/\n{3,}/g, "\n\n");
  const ig = [abre, "", "📍 " + onde, "💰 " + pr, ft && "🛏️ " + ft, "", desc.slice(0, 400), "", "💬 WhatsApp: " + zap, "🔗 Link na bio · Cód. " + (d.codigo || ""), "", assin, "", tags.join(" ")].filter((x) => x !== false && x != null).join("\n").replace(/\n{3,}/g, "\n\n").slice(0, 2150);
  return { fb, ig };
}

/* ---------- Facebook ---------- */
async function postFacebook(fts, txt, lk) {
  const ids = [];
  for (const u of fts.slice(0, 10)) { try { const r = await gpost("/" + cfg.page + "/photos", { url: jpg(u, 1600), published: "false" }); ids.push(r.id); } catch (e) { console.log("foto FB falhou:", e.message); } }
  const p = { message: txt };
  if (ids.length) ids.forEach((id, i) => (p["attached_media[" + i + "]"] = JSON.stringify({ media_fbid: id }))); else p.link = lk;
  const r = await gpost("/" + cfg.page + "/feed", p);
  return "https://www.facebook.com/" + r.id;
}
async function storyFacebook(foto) {
  const up = await gpost("/" + cfg.page + "/photos", { url: story(foto), published: "false" });
  await gpost("/" + cfg.page + "/photo_stories", { photo_id: up.id });
}

/* ---------- Instagram ---------- */
async function pronto(id) { for (let i = 0; i < 20; i++) { const s = await gget("/" + id, { fields: "status_code" }); if (s.status_code === "FINISHED") return; if (s.status_code === "ERROR") throw new Error("Instagram recusou a foto"); await espera(3000); } throw new Error("Instagram demorou demais"); }
async function postInstagram(fts, cap) {
  let cont;
  if (fts.length > 1) {
    const kids = [];
    for (const u of fts.slice(0, 10)) { const c = await gpost("/" + cfg.ig + "/media", { image_url: jpg(u, 1080), is_carousel_item: "true" }); kids.push(c.id); }
    for (const k of kids) await pronto(k);
    cont = await gpost("/" + cfg.ig + "/media", { media_type: "CAROUSEL", children: kids.join(","), caption: cap });
  } else cont = await gpost("/" + cfg.ig + "/media", { image_url: jpg(fts[0], 1080), caption: cap });
  await pronto(cont.id);
  const pub = await gpost("/" + cfg.ig + "/media_publish", { creation_id: cont.id });
  try { const m = await gget("/" + pub.id, { fields: "permalink" }); return m.permalink || ""; } catch { return ""; }
}
async function storyInstagram(foto) {
  const c = await gpost("/" + cfg.ig + "/media", { image_url: story(foto), media_type: "STORIES" });
  await pronto(c.id);
  await gpost("/" + cfg.ig + "/media_publish", { creation_id: c.id });
}

/* ---------- Telegram (canal) ---------- */
async function tg(metodo, corpo) {
  const r = await fetch("https://api.telegram.org/bot" + cfg.tgToken + "/" + metodo, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) throw new Error(j.description || "HTTP " + r.status);
  return j.result;
}
async function postTelegram(fts, txt) {
  const chat = cfg.tgChat;
  if (!fts.length) { await tg("sendMessage", { chat_id: chat, text: txt.slice(0, 4000) }); return ""; }
  const cap = txt.length > 1000 ? txt.slice(0, 1000).replace(/\s\S*$/, "") + "…" : txt;
  if (fts.length === 1) await tg("sendPhoto", { chat_id: chat, photo: jpg(fts[0], 1600), caption: cap });
  else await tg("sendMediaGroup", { chat_id: chat, media: fts.slice(0, 10).map((u, i) => Object.assign({ type: "photo", media: jpg(u, 1600) }, i ? {} : { caption: cap })) });
  return /^@/.test(chat) ? "https://t.me/" + chat.slice(1) : "";
}

/* ---------- Principal ---------- */
async function tenta(nome, fn) { try { const r = await fn(); console.log("✅", nome); return { ok: true, link: r || "" }; } catch (e) { console.log("❌", nome, e.message); return { ok: false, erro: String(e.message).slice(0, 200) }; } }

const pubs = (await jget(DB + '/fcosta_publicacoes.json?orderBy="$key"&limitToLast=300')) || {};
const pedidos = Object.entries(pubs).filter(([k, p]) => p && p.auto === true && !st.itens[k] && Date.now() - Date.parse(p.criado || 0) < MAX_IDADE);
console.log(pedidos.length + " pedido(s) novo(s). Conectado: " + conectado);

if (conectado) {
  for (const [k, p] of pedidos) {
    const d = await jget(DB + "/fcosta_imoveis/" + encodeURIComponent(p.imovelId) + ".json").catch(() => null);
    const it = { imovelId: p.imovelId, titulo: p.titulo || "", quando: new Date().toISOString() };
    if (!d) { it.erro = "Imóvel não encontrado no Painel ADM"; st.itens[k] = it; continue; }
    const fts = fotos(d), tx = textos(p.imovelId, d), quer = p.redes || {};
    if (temFB && quer.fb !== false) it.fb = await tenta("Facebook post", () => postFacebook(fts, tx.fb, link(p.imovelId, d, "facebook")));
    if (temFB && quer.fbs !== false && fts.length) it.fbs = await tenta("Facebook story", () => storyFacebook(fts[0]));
    if (temTG && quer.tg !== false) it.tg = await tenta("Telegram", () => postTelegram(fts, tx.fb));
    if (temFB && cfg.ig && fts.length) {
      if (quer.ig !== false) it.ig = await tenta("Instagram post", () => postInstagram(fts, tx.ig));
      if (quer.igs !== false) it.igs = await tenta("Instagram story", () => storyInstagram(fts[0]));
    }
    st.itens[k] = it;
  }
}
// guarda só os 60 mais novos
const ks = Object.keys(st.itens).sort(); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach((k) => delete st.itens[k]);
if (JSON.stringify(st) !== antes || (pedidos.length && conectado)) { st.atualizado = new Date().toISOString(); fs.writeFileSync(ARQ, JSON.stringify(st, null, 1)); }
