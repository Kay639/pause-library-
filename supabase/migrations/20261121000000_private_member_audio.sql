-- Only the trusted member-audio function signs URLs for this bucket.
insert into storage.buckets (id, name, public)
values ('member-audio', 'member-audio', false);

-- Keep browser roles out even if another policy grants broad Storage access.
create policy "Member audio is managed server-side"
on storage.objects
as restrictive
for all
to anon, authenticated
using (bucket_id <> 'member-audio')
with check (bucket_id <> 'member-audio');
