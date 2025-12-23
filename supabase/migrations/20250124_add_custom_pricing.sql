-- Create custom_pricing table for lead-specific pricing
-- One row per user with all plan prices
create table if not exists public.custom_pricing (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  silver_price numeric(10, 2) null default 299,
  gold_price numeric(10, 2) null default 699,
  diamond_price numeric(10, 2) null default 1599,
  diamond_plus_price numeric(10, 2) null default 1,
  currency text not null default 'USD'::text,
  notes text null,
  created_by uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint custom_pricing_pkey primary key (id),
  constraint custom_pricing_user_id_key unique (user_id),
  constraint custom_pricing_user_id_fkey foreign key (user_id) references profiles (id) on delete cascade,
  constraint custom_pricing_created_by_fkey foreign key (created_by) references profiles (id) on delete cascade
) tablespace pg_default;

-- Create index for faster lookups
create index if not exists idx_custom_pricing_user_id on public.custom_pricing using btree (user_id) tablespace pg_default;

-- Create trigger to update updated_at timestamp
create trigger update_custom_pricing_updated_at before
update on custom_pricing for each row
execute function update_updated_at_column ();

-- Add RLS policies
alter table public.custom_pricing enable row level security;

-- Admin can view all custom pricing
create policy "Admins can view all custom pricing"
  on custom_pricing for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can insert custom pricing
create policy "Admins can insert custom pricing"
  on custom_pricing for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can update custom pricing
create policy "Admins can update custom pricing"
  on custom_pricing for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Admin can delete custom pricing
create policy "Admins can delete custom pricing"
  on custom_pricing for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Users can view their own custom pricing
create policy "Users can view their own custom pricing"
  on custom_pricing for select
  using (user_id = auth.uid());

-- Comment the table
comment on table public.custom_pricing is 'Stores custom pricing per user/lead for all plans';
comment on column public.custom_pricing.user_id is 'Reference to the user (lead) this pricing applies to';
comment on column public.custom_pricing.silver_price is 'Custom price for Silver plan';
comment on column public.custom_pricing.gold_price is 'Custom price for Gold plan';
comment on column public.custom_pricing.diamond_price is 'Custom price for Diamond plan';
comment on column public.custom_pricing.diamond_plus_price is 'Custom price for Diamond+ plan';
comment on column public.custom_pricing.currency is 'Currency code (default: USD)';
comment on column public.custom_pricing.notes is 'Optional notes about this custom pricing';
comment on column public.custom_pricing.created_by is 'Admin who created this custom pricing';
