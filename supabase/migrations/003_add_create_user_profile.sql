-- Create a function to insert user profile (bypasses RLS when called with service role)
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_role TEXT,
  user_first_name TEXT,
  user_last_name TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, role, first_name, last_name)
  VALUES (user_id, user_email, user_role, user_first_name, user_last_name);

  -- Insert into role-specific table
  IF user_role = 'influencer' THEN
    INSERT INTO public.influencers (user_id, niche, is_available)
    VALUES (user_id, 'other', true);
  ELSIF user_role = 'brand' THEN
    INSERT INTO public.brands (user_id, company_name)
    VALUES (user_id, user_first_name || '''s Company');
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$;
