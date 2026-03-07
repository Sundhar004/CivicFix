-- Enable RLS: ON
CREATE TABLE issues (
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citizens can view all issues" ON issues FOR SELECT USING (true);
CREATE POLICY "Citizens can create issues" ON issues FOR INSERT WITH CHECK (auth.role() = 'citizen');
CREATE POLICY "Officers can update issues" ON issues FOR UPDATE USING (auth.role() = 'officer');
CREATE POLICY "Citizens view own issues" ON issues FOR SELECT USING (auth.uid() = created_by);

-- USERS TABLE (Add roles)
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  role VARCHAR(20) NOT NULL -- citizen|officer
);
