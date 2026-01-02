-- Create cover_letter_templates table
create table public.cover_letter_templates (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  name text not null,
  type text not null,
  content text null,
  file_path text null,
  file_name text null,
  file_size integer null,
  mime_type text null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint cover_letter_templates_pkey primary key (id),
  constraint cover_letter_templates_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
  constraint cover_letter_templates_type_check check (
    type = any (array['pdf'::text, 'text'::text])
  )
) tablespace pg_default;

-- Create indexes
create index if not exists idx_cover_letter_templates_user_id on public.cover_letter_templates using btree (user_id) tablespace pg_default;
create index if not exists idx_cover_letter_templates_type on public.cover_letter_templates using btree (type) tablespace pg_default;
create index if not exists idx_cover_letter_templates_is_active on public.cover_letter_templates using btree (is_active) tablespace pg_default;

-- Create trigger for updated_at
create trigger update_cover_letter_templates_updated_at before update on cover_letter_templates for each row execute function update_updated_at_column();

-- Note: cover-letters storage bucket already exists with user_id subfolders
-- Storage policies should already be configured for the existing bucket

-- Add RLS policies for templates table
alter table public.cover_letter_templates enable row level security;

-- Users can view their own templates
create policy "Users can view own templates"
  on public.cover_letter_templates
  for select
  using (auth.uid() = user_id);

-- Users can insert their own templates
create policy "Users can insert own templates"
  on public.cover_letter_templates
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own templates
create policy "Users can update own templates"
  on public.cover_letter_templates
  for update
  using (auth.uid() = user_id);

-- Users can delete their own templates
create policy "Users can delete own templates"
  on public.cover_letter_templates
  for delete
  using (auth.uid() = user_id);

-- Admins can view all templates
create policy "Admins can view all templates"
  on public.cover_letter_templates
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admins can update all templates
create policy "Admins can update all templates"
  on public.cover_letter_templates
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
