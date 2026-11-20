-- Existing private Storage policies call the matching schema's has_access()
-- with the first folder segment. Register the product without granting access.
begin;
insert into access.products (code, name, storage_prefix, active)
values ('pause-library', 'Pause Library', 'pause-library', true)
on conflict (code) do nothing;

insert into access_test.products (code, name, storage_prefix, active)
values ('pause-library', 'Pause Library', 'pause-library', true)
on conflict (code) do nothing;
commit;
