-- Enable RLS: ON

-- USERS TABLE (Add roles)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  role VARCHAR(20) NOT NULL DEFAULT 'citizen' -- citizen|officer
);

CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  image_url TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open|claimed|fixed
  fixed_image_url TEXT,
  created_by UUID REFERENCES auth.users,
  claimed_by UUID REFERENCES auth.users,
  resolution_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
CREATE POLICY "Users can insert own role" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view issues" ON issues;
CREATE POLICY "Anyone can view issues" ON issues FOR SELECT USING (true);

DROP POLICY IF EXISTS "Citizens can report issues" ON issues;
CREATE POLICY "Citizens can report issues" ON issues FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'citizen'
  )
);

DROP POLICY IF EXISTS "Officers can update issues" ON issues;
CREATE POLICY "Officers can update issues" ON issues FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'officer'
  )
);

-- AUTO-ASSIGN ROLE FROM METADATA ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'role', 'citizen')
  )
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE SETUP
-- Create the 'issues' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issues', 'issues', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Public Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'issues');

-- Storage Policies: Authenticated Uploads
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'issues');
-- [Add this at the very bottom of schema.sql]

-- SEED DATA: Main Officer Accounts
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'officer' 
FROM auth.users 
WHERE email = 'sundhararameshwar.senthil@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'officer';
