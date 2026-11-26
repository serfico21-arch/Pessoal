-- LOJA R-17 (produtos vendidos na barbearia). Totalmente separada do caixa da barbearia.
-- Só cria coisas novas (lj_*). Não mexe nas tabelas da barbearia. Nada é apagado: "cancelar" só marca.

create table if not exists public.lj_produtos(
  id uuid primary key default gen_random_uuid(),
  loja_id text not null,
  nome text not null,
  qtd integer not null default 0,
  custo numeric(10,2) not null default 0,
  preco numeric(10,2) not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create table if not exists public.lj_movs(
  id uuid primary key default gen_random_uuid(),
  loja_id text not null,
  data date not null,
  tipo text not null check (tipo in ('venda','entrada','saida')),
  produto_id uuid,
  produto text,
  qtd integer not null default 0,
  custo_unit numeric(10,2) not null default 0,
  valor numeric(10,2) not null default 0,
  descricao text,
  fiado_id uuid,
  cancelado boolean not null default false,
  criado_em timestamptz not null default now()
);
create table if not exists public.lj_fiado(
  id uuid primary key default gen_random_uuid(),
  loja_id text not null,
  data date not null,
  nome text not null,
  produto_id uuid,
  produto text,
  qtd integer not null default 1,
  custo_unit numeric(10,2) not null default 0,
  valor numeric(10,2) not null default 0,
  pago boolean not null default false,
  pago_em date,
  cancelado boolean not null default false,
  criado_em timestamptz not null default now()
);
create index if not exists lj_produtos_loja on public.lj_produtos(loja_id);
create index if not exists lj_movs_loja_data on public.lj_movs(loja_id,data);
create index if not exists lj_fiado_loja on public.lj_fiado(loja_id,pago);
alter table public.lj_produtos enable row level security;
alter table public.lj_movs enable row level security;
alter table public.lj_fiado enable row level security;
revoke all on public.lj_produtos, public.lj_movs, public.lj_fiado from anon, authenticated;

-- tudo de uma vez: produtos, movimentos do período e fiados
create or replace function public.lj_dados(p_token uuid, p_de date, p_ate date)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare l text := public._sessao(p_token);
begin
  return jsonb_build_object(
    'produtos', coalesce((select jsonb_agg(to_jsonb(p) order by p.ativo desc, lower(p.nome)) from public.lj_produtos p where p.loja_id=l),'[]'),
    'movs', coalesce((select jsonb_agg(to_jsonb(m) order by m.data desc, m.criado_em desc) from public.lj_movs m where m.loja_id=l and m.data between p_de and p_ate),'[]'),
    'fiados', coalesce((select jsonb_agg(to_jsonb(f) order by f.pago, f.data desc, f.criado_em desc) from public.lj_fiado f where f.loja_id=l and not f.cancelado and (not f.pago or f.pago_em between p_de and p_ate)),'[]')
  );
end $$;

create or replace function public.lj_produto_salvar(p_token uuid, p_id uuid, p_nome text, p_qtd integer, p_custo numeric, p_preco numeric)
returns uuid language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); v uuid;
begin
  if length(coalesce(trim(p_nome),''))<1 or coalesce(p_custo,0)<0 or coalesce(p_preco,0)<0 then raise exception 'dados'; end if;
  if p_id is null then
    insert into public.lj_produtos(loja_id,nome,qtd,custo,preco) values(l,left(trim(p_nome),80),coalesce(p_qtd,0),coalesce(p_custo,0),coalesce(p_preco,0)) returning id into v;
  else
    update public.lj_produtos set nome=left(trim(p_nome),80), qtd=coalesce(p_qtd,qtd), custo=coalesce(p_custo,0), preco=coalesce(p_preco,0)
     where id=p_id and loja_id=l returning id into v;
  end if;
  return v;
end $$;

-- chegou mercadoria: soma no estoque e (se quiser) lança a saída no caixa da loja
create or replace function public.lj_repor(p_token uuid, p_id uuid, p_qtd integer, p_valor numeric, p_data date)
returns void language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); pr record;
begin
  if coalesce(p_qtd,0)<1 then raise exception 'dados'; end if;
  update public.lj_produtos set qtd=qtd+p_qtd where id=p_id and loja_id=l returning * into pr;
  if pr.id is null then raise exception 'dados'; end if;
  if coalesce(p_valor,0)>0 then
    insert into public.lj_movs(loja_id,data,tipo,produto_id,produto,qtd,valor,descricao)
    values(l,coalesce(p_data,current_date),'saida',pr.id,pr.nome,p_qtd,p_valor,'Compra de mercadoria: '||pr.nome);
  end if;
end $$;

create or replace function public.lj_produto_ativo(p_token uuid, p_id uuid, p_ativo boolean)
returns void language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token);
begin update public.lj_produtos set ativo=p_ativo where id=p_id and loja_id=l; end $$;

-- venda: tira do estoque. Se tiver nome do devedor, vai para o fiado (não entra no caixa até pagar)
create or replace function public.lj_vender(p_token uuid, p_data date, p_produto uuid, p_qtd integer, p_valor numeric, p_fiado text)
returns uuid language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); pr record; v uuid;
begin
  if coalesce(p_qtd,0)<1 or coalesce(p_valor,-1)<0 then raise exception 'dados'; end if;
  update public.lj_produtos set qtd=qtd-p_qtd where id=p_produto and loja_id=l returning * into pr;
  if pr.id is null then raise exception 'dados'; end if;
  if length(coalesce(trim(p_fiado),''))>0 then
    insert into public.lj_fiado(loja_id,data,nome,produto_id,produto,qtd,custo_unit,valor)
    values(l,coalesce(p_data,current_date),left(trim(p_fiado),80),pr.id,pr.nome,p_qtd,pr.custo,p_valor) returning id into v;
  else
    insert into public.lj_movs(loja_id,data,tipo,produto_id,produto,qtd,custo_unit,valor)
    values(l,coalesce(p_data,current_date),'venda',pr.id,pr.nome,p_qtd,pr.custo,p_valor) returning id into v;
  end if;
  return v;
end $$;

create or replace function public.lj_mov_add(p_token uuid, p_data date, p_tipo text, p_descricao text, p_valor numeric)
returns uuid language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); v uuid;
begin
  if p_tipo not in ('entrada','saida') or length(coalesce(trim(p_descricao),''))<1 or coalesce(p_valor,0)<=0 then raise exception 'dados'; end if;
  insert into public.lj_movs(loja_id,data,tipo,valor,descricao) values(l,coalesce(p_data,current_date),p_tipo,p_valor,left(trim(p_descricao),120)) returning id into v;
  return v;
end $$;

-- desfazer um lançamento errado (não apaga, só marca). Venda cancelada devolve ao estoque.
create or replace function public.lj_mov_cancelar(p_token uuid, p_id uuid)
returns void language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); m record;
begin
  update public.lj_movs set cancelado=true where id=p_id and loja_id=l and not cancelado returning * into m;
  if m.id is null then return; end if;
  if m.tipo='venda' and m.produto_id is not null then
    if m.fiado_id is not null then
      update public.lj_fiado set pago=false, pago_em=null where id=m.fiado_id and loja_id=l;
    else
      update public.lj_produtos set qtd=qtd+m.qtd where id=m.produto_id and loja_id=l;
    end if;
  end if;
  if m.tipo='saida' and m.produto_id is not null and m.descricao like 'Compra de mercadoria:%' then
    update public.lj_produtos set qtd=qtd-m.qtd where id=m.produto_id and loja_id=l;
  end if;
end $$;

-- fiado pago: entra no caixa da loja no dia do pagamento
create or replace function public.lj_fiado_pagar(p_token uuid, p_id uuid, p_data date)
returns void language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); f record;
begin
  update public.lj_fiado set pago=true, pago_em=coalesce(p_data,current_date) where id=p_id and loja_id=l and not pago and not cancelado returning * into f;
  if f.id is null then return; end if;
  insert into public.lj_movs(loja_id,data,tipo,produto_id,produto,qtd,custo_unit,valor,descricao,fiado_id)
  values(l,f.pago_em,'venda',f.produto_id,f.produto,f.qtd,f.custo_unit,f.valor,'Fiado pago: '||f.nome,f.id);
end $$;

-- fiado anotado errado: marca cancelado e devolve ao estoque
create or replace function public.lj_fiado_cancelar(p_token uuid, p_id uuid)
returns void language plpgsql security definer set search_path to '' as $$
declare l text := public._sessao(p_token); f record;
begin
  update public.lj_fiado set cancelado=true where id=p_id and loja_id=l and not pago and not cancelado returning * into f;
  if f.id is not null and f.produto_id is not null then
    update public.lj_produtos set qtd=qtd+f.qtd where id=f.produto_id and loja_id=l;
  end if;
end $$;

grant execute on function public.lj_dados(uuid,date,date), public.lj_produto_salvar(uuid,uuid,text,integer,numeric,numeric),
  public.lj_repor(uuid,uuid,integer,numeric,date), public.lj_produto_ativo(uuid,uuid,boolean),
  public.lj_vender(uuid,date,uuid,integer,numeric,text), public.lj_mov_add(uuid,date,text,text,numeric),
  public.lj_mov_cancelar(uuid,uuid), public.lj_fiado_pagar(uuid,uuid,date), public.lj_fiado_cancelar(uuid,uuid) to anon, authenticated;

-- Versão 36: editar e excluir (excluir só esconde; dados ficam guardados)
alter table public.lj_produtos add column if not exists excluido boolean not null default false;
-- lj_dados passou a esconder produtos excluídos e lançamentos cancelados.
-- Funções novas: lj_produto_excluir(token,id), lj_mov_editar(token,id,data,descricao,valor), lj_fiado_editar(token,id,nome,data,valor).
