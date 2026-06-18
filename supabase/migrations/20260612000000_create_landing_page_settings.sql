-- Redefine get_user_role() as plpgsql security definer to avoid RLS recursion issues
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
DECLARE
  r user_role;
BEGIN
  SELECT role INTO r FROM public.user_profiles WHERE id = auth.uid();
  RETURN r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create landing_page_settings table
CREATE TABLE IF NOT EXISTS public.landing_page_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title TEXT NOT NULL DEFAULT 'Pure Spices. Pure Trust.',
  hero_subtitle TEXT NOT NULL DEFAULT 'Premium quality spices for B2B, retail, distributors, and export markets — under our brand Aviraaj.',
  hero_image_url TEXT NOT NULL DEFAULT '',
  about_title TEXT NOT NULL DEFAULT 'Premium Spice Manufacturing & Export',
  about_text TEXT NOT NULL DEFAULT 'Agrozaar Foods LLP manufactures and exports premium spices under the Aviraaj brand. We focus on quality and purity.',
  about_image_url TEXT NOT NULL DEFAULT '',
  products_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  export_countries JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- Allow select to everyone (including anonymous website visitors)
DROP POLICY IF EXISTS "Allow select on landing_page_settings to everyone" ON public.landing_page_settings;
CREATE POLICY "Allow select on landing_page_settings to everyone"
  ON public.landing_page_settings FOR SELECT
  USING (true);

-- Allow all write operations to super-admin, admin and supervisor
DROP POLICY IF EXISTS "Allow write on landing_page_settings to admins" ON public.landing_page_settings;
CREATE POLICY "Allow write on landing_page_settings to admins"
  ON public.landing_page_settings FOR ALL TO authenticated
  USING (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'))
  WITH CHECK (public.get_user_role() IN ('super-admin', 'admin', 'supervisor'));

-- Seed default landing page configuration
INSERT INTO public.landing_page_settings (
  id, hero_title, hero_subtitle, products_data, export_countries
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pure Spices. Pure Trust.',
  'Premium quality spices for B2B, retail, distributors, and export markets — crafted with modern processing and uncompromised purity under our brand Aviraaj.',
  '[
    {"name": "Turmeric Powder", "desc": "Vibrant golden color with high curcumin content and rich earthy aroma.", "image_url": ""},
    {"name": "Chilli Powder", "desc": "Natural red color and balanced heat, milled from premium-grade chillies.", "image_url": ""},
    {"name": "Coriander Powder", "desc": "Freshly ground from sorted seeds for a fragrant, citrusy flavor.", "image_url": ""},
    {"name": "Cumin Powder", "desc": "Warm, nutty and aromatic — a kitchen and processing essential.", "image_url": ""},
    {"name": "Garam Masala", "desc": "Signature blend of whole spices for authentic depth and warmth.", "image_url": ""}
  ]'::jsonb,
  '["UAE", "USA", "UK", "Canada", "Australia", "Saudi Arabia", "Singapore", "Malaysia"]'::jsonb
) ON CONFLICT (id) DO NOTHING;
