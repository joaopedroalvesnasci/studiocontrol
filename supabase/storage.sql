-- StudioControl — políticas do Storage (bucket "referencias")
-- Cada usuário só manipula arquivos dentro da pasta com o próprio ID.

create policy "referencias_upload_proprio" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'referencias'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "referencias_update_proprio" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'referencias'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "referencias_delete_proprio" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'referencias'
    and (storage.foldername(name))[1] = auth.uid()::text
  );