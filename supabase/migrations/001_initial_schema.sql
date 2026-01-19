-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('influencer', 'brand')),
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view public user info"
  ON users FOR SELECT
  USING (true);

-- ============================================
-- INFLUENCERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS influencers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  niche TEXT,
  platforms TEXT[] DEFAULT '{}',
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  youtube_handle TEXT,
  youtube_subscribers INTEGER DEFAULT 0,
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  twitter_handle TEXT,
  twitter_followers INTEGER DEFAULT 0,
  rate_per_post DECIMAL(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for influencers
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Influencers can view their own profile"
  ON influencers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Influencers can update their own profile"
  ON influencers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view influencer profiles"
  ON influencers FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their influencer profile"
  ON influencers FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- BRANDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  industry TEXT,
  website TEXT,
  company_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view their own profile"
  ON brands FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Brands can update their own profile"
  ON brands FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view brand profiles"
  ON brands FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their brand profile"
  ON brands FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- COLLABORATION REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  campaign_title TEXT NOT NULL,
  campaign_description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for collaboration_requests
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view their sent requests"
  ON collaboration_requests FOR SELECT
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Influencers can view their received requests"
  ON collaboration_requests FOR SELECT
  USING (influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid()));

CREATE POLICY "Brands can create requests"
  ON collaboration_requests FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Brands can update their requests"
  ON collaboration_requests FOR UPDATE
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Influencers can update request status"
  ON collaboration_requests FOR UPDATE
  USING (influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid()));

-- ============================================
-- REQUEST DELIVERABLES TABLE (for request stage)
-- ============================================
CREATE TABLE IF NOT EXISTS request_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('post', 'story', 'reel', 'video', 'blog', 'other')),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for request_deliverables
ALTER TABLE request_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deliverables for their requests"
  ON request_deliverables FOR SELECT
  USING (
    request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Brands can create deliverables"
  ON request_deliverables FOR INSERT
  WITH CHECK (
    request_id IN (
      SELECT id FROM collaboration_requests
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL REFERENCES collaboration_requests(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('accepted', 'in_progress', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands can view their campaigns"
  ON campaigns FOR SELECT
  USING (brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid()));

CREATE POLICY "Influencers can view their campaigns"
  ON campaigns FOR SELECT
  USING (influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid()));

CREATE POLICY "System can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
    OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can update campaigns"
  ON campaigns FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
    OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
  );

-- ============================================
-- DELIVERABLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('post', 'story', 'reel', 'video', 'blog', 'other')),
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  submission_url TEXT,
  submission_notes TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for deliverables
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign participants can view deliverables"
  ON deliverables FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "System can create deliverables"
  ON deliverables FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Influencers can submit deliverables"
  ON deliverables FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Brands can review deliverables"
  ON deliverables FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Campaign participants can view messages"
  ON messages FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Campaign participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark their messages as read"
  ON messages FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, reviewer_id)
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Campaign participants can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND campaign_id IN (
      SELECT id FROM campaigns
      WHERE brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
      OR influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_requests_updated_at
  BEFORE UPDATE ON collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update campaign progress based on deliverables
CREATE OR REPLACE FUNCTION update_campaign_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_count INTEGER;
  approved_count INTEGER;
  new_progress INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'approved')
  INTO total_count, approved_count
  FROM deliverables
  WHERE campaign_id = NEW.campaign_id;

  IF total_count > 0 THEN
    new_progress := (approved_count * 100) / total_count;
  ELSE
    new_progress := 0;
  END IF;

  UPDATE campaigns
  SET progress_percentage = new_progress,
      status = CASE
        WHEN new_progress = 100 THEN 'completed'
        WHEN new_progress > 0 THEN 'in_progress'
        ELSE status
      END
  WHERE id = NEW.campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_campaign_progress
  AFTER UPDATE OF status ON deliverables
  FOR EACH ROW EXECUTE FUNCTION update_campaign_progress();

-- Function to create campaign when request is accepted
CREATE OR REPLACE FUNCTION create_campaign_on_accept()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'requested' THEN
    -- Create campaign
    INSERT INTO campaigns (
      request_id,
      brand_id,
      influencer_id,
      title,
      description,
      requirements,
      budget,
      start_date,
      deadline
    )
    VALUES (
      NEW.id,
      NEW.brand_id,
      NEW.influencer_id,
      NEW.campaign_title,
      NEW.campaign_description,
      NEW.requirements,
      NEW.budget,
      NEW.start_date,
      NEW.end_date
    );

    -- Copy deliverables from request to campaign
    INSERT INTO deliverables (campaign_id, title, description, type, platform)
    SELECT 
      (SELECT id FROM campaigns WHERE request_id = NEW.id),
      rd.title,
      rd.description,
      rd.type,
      rd.platform
    FROM request_deliverables rd
    WHERE rd.request_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_campaign_on_accept
  AFTER UPDATE OF status ON collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION create_campaign_on_accept();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON influencers(user_id);
CREATE INDEX IF NOT EXISTS idx_influencers_niche ON influencers(niche);
CREATE INDEX IF NOT EXISTS idx_influencers_is_available ON influencers(is_available);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_industry ON brands(industry);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_brand_id ON collaboration_requests(brand_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_influencer_id ON collaboration_requests(influencer_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_influencer_id ON campaigns(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_deliverables_campaign_id ON deliverables(campaign_id);
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status);
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_reviews_campaign_id ON reviews(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
