-- Drop unused legacy profiles table (superseded by user_profiles)
-- Also drop the associated trigger and function that would fail without the table

-- Drop trigger first (references auth.users, not profiles, so CASCADE won't catch it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop the table
DROP TABLE IF EXISTS public.profiles CASCADE;
