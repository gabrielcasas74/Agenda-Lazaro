-- Políticas RLS para usuario autenticado únicamente

create policy "solo_autenticado" on clientes
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on citas
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on notas
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on ingresos_manual
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on clientes_contables
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on declaraciones
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "solo_autenticado" on pagos_honorarios
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
