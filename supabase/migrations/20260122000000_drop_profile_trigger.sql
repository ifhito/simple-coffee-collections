-- Drop the trigger and function that reference the deleted profiles table
-- The profiles table was dropped but the trigger/function were left behind,
-- causing "Database error saving new user" on signup

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
