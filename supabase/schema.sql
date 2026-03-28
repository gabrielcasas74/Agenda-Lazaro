-- Lázaro Agenda — Schema completo

-- Clientes de Lázaro (tarot)
create table if not exists clientes (
  id text primary key,
  nombre text not null,
  telefono text not null default '',
  fecha_nacimiento text not null default '',
  modalidad_usual text not null default 'presencial',
  intereses text[] not null default '{}',
  nombres_importantes text[] not null default '{}',
  productos_trabajos text[] not null default '{}',
  resena text,
  creado_en timestamptz not null default now(),
  total_citas integer not null default 0,
  total_ingresos integer not null default 0
);

-- Citas de Lázaro
create table if not exists citas (
  id text primary key,
  cliente_id text references clientes(id),
  cliente_nombre text not null,
  cliente_telefono text not null default '',
  cliente_fecha_nacimiento text not null default '',
  tipo text not null,
  modalidad text not null,
  fecha text not null,
  hora text not null,
  intencion text not null default '',
  estado text not null default 'confirmada',
  precio integer not null default 0,
  creado_en timestamptz not null default now(),
  cal_event_id text
);

-- Notas de sesión
create table if not exists notas (
  id text primary key,
  cita_id text references citas(id),
  cliente_id text references clientes(id),
  fecha timestamptz not null default now(),
  texto text not null,
  creado_en timestamptz not null default now()
);

-- Ingresos manuales de Lázaro
create table if not exists ingresos_manual (
  id text primary key,
  descripcion text not null,
  monto integer not null,
  fecha text not null,
  creado_en timestamptz not null default now()
);

-- Clientes contables
create table if not exists clientes_contables (
  id text primary key,
  nombre text not null,
  cedula text not null default '',
  telefono text not null default '',
  email text not null default '',
  honorarios_mensuales integer not null default 0,
  estado text not null default 'al_dia',
  notas text not null default '',
  creado_en timestamptz not null default now()
);

-- Declaraciones contables
create table if not exists declaraciones (
  id text primary key,
  cliente_id text references clientes_contables(id),
  tipo text not null,
  descripcion text not null,
  fecha_personalizada text,
  periodicidad text not null default 'mensual',
  completada boolean not null default false,
  ultima_completada timestamptz,
  notas text not null default ''
);

-- Pagos de honorarios
create table if not exists pagos_honorarios (
  id text primary key,
  cliente_id text references clientes_contables(id),
  mes integer not null,
  anio integer not null,
  monto integer not null,
  pagado boolean not null default false,
  fecha_pago timestamptz,
  notas text not null default '',
  unique(cliente_id, mes, anio)
);

-- RLS (Row Level Security) — acceso público por ahora
alter table clientes enable row level security;
alter table citas enable row level security;
alter table notas enable row level security;
alter table ingresos_manual enable row level security;
alter table clientes_contables enable row level security;
alter table declaraciones enable row level security;
alter table pagos_honorarios enable row level security;

create policy "acceso_publico" on clientes for all using (true) with check (true);
create policy "acceso_publico" on citas for all using (true) with check (true);
create policy "acceso_publico" on notas for all using (true) with check (true);
create policy "acceso_publico" on ingresos_manual for all using (true) with check (true);
create policy "acceso_publico" on clientes_contables for all using (true) with check (true);
create policy "acceso_publico" on declaraciones for all using (true) with check (true);
create policy "acceso_publico" on pagos_honorarios for all using (true) with check (true);
