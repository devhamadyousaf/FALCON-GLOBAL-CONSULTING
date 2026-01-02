-- Add 'other' (Rest of World) as a valid relocation type option
-- This allows users to select destinations outside Europe and GCC countries

-- Drop the existing constraint
ALTER TABLE public.onboarding_data
DROP CONSTRAINT IF EXISTS onboarding_data_relocation_type_check;

-- Add the new constraint with 'other' option included
ALTER TABLE public.onboarding_data
ADD CONSTRAINT onboarding_data_relocation_type_check
CHECK (relocation_type = ANY (ARRAY['europe'::text, 'gcc'::text, 'other'::text]));

-- Add a comment to document the relocation types
COMMENT ON COLUMN public.onboarding_data.relocation_type IS
'Relocation destination type: europe (European countries with visa check), gcc (GCC countries without visa check), other (Rest of World without visa check)';
