-- Reset Onboarding Data for User
-- Run this in your Supabase SQL Editor to clean start

-- Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- You can find it in the database or from the data you showed: 3b37ee84-3a7a-40aa-99ba-1fba23dbc550

-- Delete existing onboarding data
DELETE FROM onboarding_data WHERE user_id = '3b37ee84-3a7a-40aa-99ba-1fba23dbc550';

-- Reset onboarding_complete flag in profiles
UPDATE profiles
SET onboarding_complete = false
WHERE id = '3b37ee84-3a7a-40aa-99ba-1fba23dbc550';

-- Verify the reset
SELECT id, email, onboarding_complete FROM profiles WHERE id = '3b37ee84-3a7a-40aa-99ba-1fba23dbc550';
SELECT * FROM onboarding_data WHERE user_id = '3b37ee84-3a7a-40aa-99ba-1fba23dbc550';
