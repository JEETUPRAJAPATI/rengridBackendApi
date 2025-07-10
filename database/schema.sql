-- Create database schema for Admin Authentication & Management System

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  is_blocked BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  last_login_ip INET,
  login_attempts INT DEFAULT 0,
  provider VARCHAR(50),
  provider_id VARCHAR(100),
  user_type VARCHAR(50) DEFAULT 'user',
  profile_image TEXT,
  address TEXT,
  dob DATE,
  gender VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User logins table
CREATE TABLE IF NOT EXISTS user_logins (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  login_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  platform VARCHAR(50),
  location TEXT,
  status VARCHAR(20) DEFAULT 'success'
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  is_super_admin BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  last_login_ip INET,
  login_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Role Admin junction table
CREATE TABLE IF NOT EXISTS role_admin (
  admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (admin_id, role_id)
);

-- Permission Role junction table
CREATE TABLE IF NOT EXISTS permission_role (
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Permission Admin junction table (direct permissions)
CREATE TABLE IF NOT EXISTS permission_admin (
  admin_id BIGINT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (admin_id, permission_id)
);

-- Admin Password Resets table
CREATE TABLE IF NOT EXISTS admin_password_resets (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id BIGSERIAL PRIMARY KEY,

  -- Identifiers
  unique_id VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  purpose VARCHAR(50),

  -- Type & Category
  category_id BIGINT REFERENCES property_categories(id) ON DELETE SET NULL,
  property_type VARCHAR(50) NOT NULL CHECK (
    property_type IN ('apartment', 'villa', 'house', 'plot', 'office', 'shop', 'warehouse', 'co-living')
  ),
  listing_type VARCHAR(20) NOT NULL CHECK (
    listing_type IN ('rent', 'sale', 'lease')
  ),

  -- Financials
  price DECIMAL(12, 2),
  monthly_rent DECIMAL(12, 2),
  security_deposit DECIMAL(12, 2),

  -- Location
  city VARCHAR(100),
  locality VARCHAR(150),
  address TEXT,
  map_location TEXT,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),

  -- Area
  area DECIMAL(10, 2) NOT NULL CHECK (area > 0),
  area_unit VARCHAR(20) DEFAULT 'sqft' CHECK (
    area_unit IN ('sqft', 'sqm', 'acre', 'bigha')
  ),

  -- Configuration
  bedroom INTEGER DEFAULT 0 CHECK (bedroom >= 0),
  bathroom INTEGER DEFAULT 0 CHECK (bathroom >= 0),
  balcony INTEGER DEFAULT 0 CHECK (balcony >= 0),
  bhk INTEGER DEFAULT 0 CHECK (bhk >= 0),
  floor_no INTEGER,
  total_floors INTEGER,

  -- Furnishing & Media
  furnish_type VARCHAR(30) DEFAULT 'unfurnished' CHECK (
    furnish_type IN ('furnished', 'unfurnished', 'semi-furnished')
  ),
  floor_plan TEXT,

  -- Availability
  available_from DATE NOT NULL DEFAULT CURRENT_DATE,
  available_for JSONB DEFAULT '["Family"]'::jsonb,

  -- Status
  status VARCHAR(30) DEFAULT 'draft' CHECK (
    status IN ('draft', 'published', 'blocked', 'sold', 'rented', 'pending_verification', 'verified', 'rejected')
  ),
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  -- Verification
  verified_by BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,

  -- Ownership
  owner_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

  -- Analytics
  views_count INTEGER DEFAULT 0,

  -- Meta Info
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Images table
CREATE TABLE property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_type VARCHAR(20) DEFAULT 'gallery' CHECK (image_type IN ('gallery', 'floor_plan', 'featured')),
  video TEXT,
  image_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  alt_text VARCHAR(255),
  uploaded_by BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE property_documents (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (doc_type IN ('ownership_deed', 'tax_receipt', 'noc', 'floor_plan', 'legal_clearance', 'rental_agreement', 'other')),
  doc_path TEXT NOT NULL,
  document_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  uploaded_by BIGINT REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Features table
CREATE TABLE property_features (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_key VARCHAR(100) NOT NULL,
  feature_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Property Location Table
CREATE TABLE property_location (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  locality VARCHAR(150) NOT NULL,
  landmark VARCHAR(255),
  zipcode VARCHAR(20),
  full_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id)
);
-- Amenities table
-- 7. Amenities Table
CREATE TABLE amenities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'security', 'recreation', 'convenience', 'connectivity')),
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Property Amenities Junction Table
CREATE TABLE property_amenities (
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);
CREATE TABLE property_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_purpose ON properties(purpose);
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON properties(is_deleted);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON admin_password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON admin_password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON admin_password_resets(expires_at);