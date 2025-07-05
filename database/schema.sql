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
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(12, 2),
  city VARCHAR(100),
  locality VARCHAR(150),
  address TEXT,
  area_sqft DECIMAL(10, 2),
  bedrooms INT,
  bathrooms INT,
  balconies INT,
  bhk INT,
  property_type VARCHAR(50),
  purpose VARCHAR(50),
  furnishing VARCHAR(50),
  available_for VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  owner_id BIGINT,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,
  featured_image TEXT,
  floor_plan TEXT,
  map_latitude DECIMAL(10,6),
  map_longitude DECIMAL(10,6),
  map_address TEXT,
  views INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Property Images table
CREATE TABLE IF NOT EXISTS property_images (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_gallery BOOLEAN DEFAULT TRUE,
  is_floor_plan BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property Features table
CREATE TABLE IF NOT EXISTS property_features (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  icon VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property Amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
  property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
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