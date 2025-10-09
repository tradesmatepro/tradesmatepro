-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_user_count integer;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO first_user_count FROM public.profiles;
  
  INSERT INTO public.profiles (id, role)
  VALUES (
    new.id,
    CASE WHEN first_user_count = 0 THEN 'OWNER' ELSE 'EMPLOYEE' END
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update updated_at trigger for profiles
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
