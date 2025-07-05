import { Property } from '../models/Property.js';
import { generateSlug } from '../utils/helpers.js';
import { query } from '../config/database.js';
import logger from '../utils/logger.js';

export class PropertyService {
  static async createProperty(propertyData) {
    try {
      const { title, slug, features, amenities, ...otherData } = propertyData;
      
      const propertySlug = slug || generateSlug(title);

      // Check if slug already exists
      const existingProperty = await query('SELECT id FROM properties WHERE slug = $1', [propertySlug]);
      if (existingProperty.rows.length > 0) {
        throw new Error('Property with this slug already exists');
      }

      // Create property
      const property = await Property.create({
        title,
        slug: propertySlug,
        ...otherData
      });

      const propertyId = property.id;

      // Add features
      if (features && features.length > 0) {
        const featureQueries = features.map(feature => 
          query('INSERT INTO property_features (property_id, name) VALUES ($1, $2)', [propertyId, feature])
        );
        await Promise.all(featureQueries);
      }

      // Add amenities
      if (amenities && amenities.length > 0) {
        const amenityQueries = amenities.map(amenityId => 
          query('INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2)', [propertyId, amenityId])
        );
        await Promise.all(amenityQueries);
      }

      logger.info(`Property created successfully: ${title}`);
      return { propertyId };
    } catch (error) {
      logger.error('PropertyService createProperty error:', error);
      throw error;
    }
  }

  static async getAllProperties(filters = {}) {
    try {
      const { page = 1, limit = 10, search = '', status, city, type, purpose, is_featured } = filters;
      const offset = (page - 1) * limit;

      const filterOptions = {
        search,
        status,
        city,
        type,
        purpose,
        is_featured: is_featured === 'true' ? true : is_featured === 'false' ? false : undefined,
        limit,
        offset
      };

      const result = await Property.getAll(filterOptions);

      return {
        data: result.properties,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit)
        }
      };
    } catch (error) {
      logger.error('PropertyService getAllProperties error:', error);
      throw error;
    }
  }

  static async getPropertyById(id) {
    try {
      const property = await Property.findById(id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Get related data
      const images = await Property.getImages(id);
      const features = await Property.getFeatures(id);
      const amenities = await Property.getAmenities(id);

      return {
        ...property,
        images,
        features,
        amenities
      };
    } catch (error) {
      logger.error('PropertyService getPropertyById error:', error);
      throw error;
    }
  }

  static async updateProperty(id, propertyData) {
    try {
      const { features, amenities, ...otherData } = propertyData;

      // Check if property exists
      const existingProperty = await Property.findById(id);
      if (!existingProperty) {
        throw new Error('Property not found');
      }

      // Update property basic info
      if (Object.keys(otherData).length > 0) {
        await Property.update(id, otherData);
      }

      // Update features
      if (features !== undefined) {
        await query('DELETE FROM property_features WHERE property_id = $1', [id]);
        
        if (features.length > 0) {
          const featureQueries = features.map(feature => 
            query('INSERT INTO property_features (property_id, name) VALUES ($1, $2)', [id, feature])
          );
          await Promise.all(featureQueries);
        }
      }

      // Update amenities
      if (amenities !== undefined) {
        await query('DELETE FROM property_amenities WHERE property_id = $1', [id]);
        
        if (amenities.length > 0) {
          const amenityQueries = amenities.map(amenityId => 
            query('INSERT INTO property_amenities (property_id, amenity_id) VALUES ($1, $2)', [id, amenityId])
          );
          await Promise.all(amenityQueries);
        }
      }

      logger.info(`Property updated successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('PropertyService updateProperty error:', error);
      throw error;
    }
  }

  static async updatePropertyStatus(id, status) {
    try {
      const existingProperty = await Property.findById(id);
      if (!existingProperty) {
        throw new Error('Property not found');
      }

      await Property.update(id, { status });
      logger.info(`Property status updated to ${status}: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('PropertyService updatePropertyStatus error:', error);
      throw error;
    }
  }

  static async deleteProperty(id) {
    try {
      const existingProperty = await Property.findById(id);
      if (!existingProperty) {
        throw new Error('Property not found');
      }

      await Property.softDelete(id);
      logger.info(`Property deleted successfully: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error('PropertyService deleteProperty error:', error);
      throw error;
    }
  }

  static async uploadPropertyImages(propertyId, images) {
    try {
      const existingProperty = await Property.findById(propertyId);
      if (!existingProperty) {
        throw new Error('Property not found');
      }

      if (images && images.length > 0) {
        const imageQueries = images.map(image => 
          query(
            'INSERT INTO property_images (property_id, image_url, is_gallery, is_floor_plan, sort_order) VALUES ($1, $2, $3, $4, $5)',
            [propertyId, image.url, image.is_gallery || true, image.is_floor_plan || false, image.sort_order || 0]
          )
        );
        await Promise.all(imageQueries);
      }

      logger.info(`Images uploaded for property: ${propertyId}`);
      return { success: true };
    } catch (error) {
      logger.error('PropertyService uploadPropertyImages error:', error);
      throw error;
    }
  }

  static async deletePropertyImage(propertyId, imageId) {
    try {
      const imageResult = await query(
        'SELECT id FROM property_images WHERE id = $1 AND property_id = $2',
        [imageId, propertyId]
      );

      if (imageResult.rows.length === 0) {
        throw new Error('Image not found');
      }

      await query('DELETE FROM property_images WHERE id = $1', [imageId]);
      logger.info(`Image deleted: ${imageId} from property: ${propertyId}`);
      return { success: true };
    } catch (error) {
      logger.error('PropertyService deletePropertyImage error:', error);
      throw error;
    }
  }

  static async getAllAmenities() {
    try {
      const result = await query(
        'SELECT id, name, icon FROM amenities ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      logger.error('PropertyService getAllAmenities error:', error);
      throw error;
    }
  }
}