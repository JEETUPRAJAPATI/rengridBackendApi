import { query } from '../config/database.js';
import { hashPassword } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // 1. Create Super Admin
    const superAdminPassword = await hashPassword('admin123');
    await query(`
      INSERT INTO admins (name, email, password, status, is_super_admin)
      VALUES ('Super Admin', 'admin@example.com', $1, 'active', true)
      ON CONFLICT (email) DO NOTHING
    `, [superAdminPassword]);
    logger.info('✅ Super Admin created');

    // 2. Create sample permissions
    const permissions = [
      { name: 'admin.view', module: 'admin', action: 'view', description: 'View admins' },
      { name: 'admin.create', module: 'admin', action: 'create', description: 'Create admins' },
      { name: 'admin.edit', module: 'admin', action: 'edit', description: 'Edit admins' },
      { name: 'admin.delete', module: 'admin', action: 'delete', description: 'Delete admins' },
      { name: 'role.view', module: 'role', action: 'view', description: 'View roles' },
      { name: 'role.create', module: 'role', action: 'create', description: 'Create roles' },
      { name: 'role.edit', module: 'role', action: 'edit', description: 'Edit roles' },
      { name: 'role.delete', module: 'role', action: 'delete', description: 'Delete roles' },
      { name: 'permission.view', module: 'permission', action: 'view', description: 'View permissions' },
      { name: 'permission.create', module: 'permission', action: 'create', description: 'Create permissions' },
      { name: 'permission.edit', module: 'permission', action: 'edit', description: 'Edit permissions' },
      { name: 'permission.delete', module: 'permission', action: 'delete', description: 'Delete permissions' },
      { name: 'user.view', module: 'user', action: 'view', description: 'View users' },
      { name: 'user.create', module: 'user', action: 'create', description: 'Create users' },
      { name: 'user.edit', module: 'user', action: 'edit', description: 'Edit users' },
      { name: 'user.delete', module: 'user', action: 'delete', description: 'Delete users' },
      { name: 'property.view', module: 'property', action: 'view', description: 'View properties' },
      { name: 'property.create', module: 'property', action: 'create', description: 'Create properties' },
      { name: 'property.edit', module: 'property', action: 'edit', description: 'Edit properties' },
      { name: 'property.delete', module: 'property', action: 'delete', description: 'Delete properties' }
    ];

    for (const permission of permissions) {
      await query(`
        INSERT INTO permissions (name, module, action, description)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO NOTHING
      `, [permission.name, permission.module, permission.action, permission.description]);
    }
    logger.info('✅ Permissions created');

    // 3. Create sample roles
    const roles = [
      { name: 'Manager', slug: 'manager', description: 'Property and user management' },
      { name: 'Editor', slug: 'editor', description: 'Content editing and publishing' },
      { name: 'Viewer', slug: 'viewer', description: 'Read-only access' }
    ];

    for (const role of roles) {
      await query(`
        INSERT INTO roles (name, slug, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (slug) DO NOTHING
      `, [role.name, role.slug, role.description]);
    }
    logger.info('✅ Roles created');

    // 4. Assign permissions to roles
    const managerPermissions = [
      'user.view', 'user.create', 'user.edit', 'user.delete',
      'property.view', 'property.create', 'property.edit', 'property.delete'
    ];

    const managerRoleResult = await query('SELECT id FROM roles WHERE slug = $1', ['manager']);
    if (managerRoleResult.rows.length > 0) {
      const managerRoleId = managerRoleResult.rows[0].id;
      
      for (const permissionName of managerPermissions) {
        const permissionResult = await query('SELECT id FROM permissions WHERE name = $1', [permissionName]);
        if (permissionResult.rows.length > 0) {
          const permissionId = permissionResult.rows[0].id;
          await query(`
            INSERT INTO permission_role (role_id, permission_id)
            VALUES ($1, $2)
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [managerRoleId, permissionId]);
        }
      }
    }

    // 5. Create sample admin with Manager role
    const managerPassword = await hashPassword('manager123');
    const adminResult = await query(`
      INSERT INTO admins (name, email, password, status, is_super_admin)
      VALUES ('John Manager', 'manager@example.com', $1, 'active', false)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [managerPassword]);

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      if (managerRoleResult.rows.length > 0) {
        const managerRoleId = managerRoleResult.rows[0].id;
        await query(`
          INSERT INTO role_admin (admin_id, role_id)
          VALUES ($1, $2)
          ON CONFLICT (admin_id, role_id) DO NOTHING
        `, [adminId, managerRoleId]);
      }
    }
    logger.info('✅ Sample admin created');

    // 6. Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        password: await hashPassword('user123'),
        user_type: 'premium',
        address: '123 Main St, Mumbai',
        gender: 'male'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        password: await hashPassword('user123'),
        user_type: 'user',
        address: '456 Oak Ave, Delhi',
        gender: 'female'
      }
    ];

    for (const user of sampleUsers) {
      await query(`
        INSERT INTO users (name, email, phone, password, user_type, address, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO NOTHING
      `, [user.name, user.email, user.phone, user.password, user.user_type, user.address, user.gender]);
    }
    logger.info('✅ Sample users created');

    // 7. Create sample amenities
    const amenities = [
      { name: 'Swimming Pool', icon: 'pool' },
      { name: 'Gym', icon: 'dumbbell' },
      { name: 'Parking', icon: 'car' },
      { name: 'Security', icon: 'shield' },
      { name: 'Garden', icon: 'trees' }
    ];

    for (const amenity of amenities) {
      await query(`
        INSERT INTO amenities (name, icon)
        VALUES ($1, $2)
        ON CONFLICT (name) DO NOTHING
      `, [amenity.name, amenity.icon]);
    }
    logger.info('✅ Amenities created');

    // 8. Create sample properties
    const sampleProperties = [
      {
        title: 'Luxury 3BHK Apartment in Mumbai',
        slug: 'luxury-3bhk-apartment-mumbai',
        price: 8500000,
        city: 'Mumbai',
        locality: 'Bandra West',
        address: '123 Linking Road, Bandra West, Mumbai',
        area_sqft: 1200,
        bedrooms: 3,
        bathrooms: 2,
        balconies: 2,
        bhk: 3,
        property_type: 'apartment',
        purpose: 'sale',
        furnishing: 'furnished',
        available_for: 'family',
        status: 'published',
        is_featured: true,
        description: 'Beautiful 3BHK apartment with modern amenities and great location.',
        meta_title: 'Luxury 3BHK Apartment for Sale in Mumbai',
        meta_description: 'Premium 3BHK apartment in Bandra West with modern amenities',
        meta_keywords: 'apartment, mumbai, bandra, 3bhk, luxury',
        map_latitude: 19.0596,
        map_longitude: 72.8295,
        map_address: 'Bandra West, Mumbai, Maharashtra'
      }
    ];

    for (const property of sampleProperties) {
      const propertyResult = await query(`
        INSERT INTO properties (
          title, slug, price, city, locality, address, area_sqft, bedrooms, bathrooms, balconies,
          bhk, property_type, purpose, furnishing, available_for, status, is_featured,
          description, meta_title, meta_description, meta_keywords, map_latitude, map_longitude, map_address
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      `, [
        property.title, property.slug, property.price, property.city, property.locality, property.address,
        property.area_sqft, property.bedrooms, property.bathrooms, property.balconies, property.bhk,
        property.property_type, property.purpose, property.furnishing, property.available_for,
        property.status, property.is_featured, property.description, property.meta_title,
        property.meta_description, property.meta_keywords, property.map_latitude, property.map_longitude,
        property.map_address
      ]);

      if (propertyResult.rows.length > 0) {
        const propertyId = propertyResult.rows[0].id;
        
        // Add some features
        const features = ['Balcony', 'Modular Kitchen', 'Parking', 'Security'];
        for (const feature of features) {
          await query(`
            INSERT INTO property_features (property_id, name)
            VALUES ($1, $2)
          `, [propertyId, feature]);
        }

        // Add some amenities
        const amenityIds = [1, 2, 3, 4]; // Swimming Pool, Gym, Parking, Security
        for (const amenityId of amenityIds) {
          await query(`
            INSERT INTO property_amenities (property_id, amenity_id)
            VALUES ($1, $2)
            ON CONFLICT (property_id, amenity_id) DO NOTHING
          `, [propertyId, amenityId]);
        }
      }
    }
    logger.info('✅ Sample properties created');

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('\n📋 Login Credentials:');
    logger.info('Super Admin: admin@example.com / admin123');
    logger.info('Manager: manager@example.com / manager123');
    logger.info('Sample Users: john@example.com, jane@example.com / user123');

  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeding
seedDatabase()
  .then(() => {
    logger.info('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  });