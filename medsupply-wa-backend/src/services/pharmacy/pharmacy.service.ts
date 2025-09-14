import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';
import { Pharmacy } from '../../core/database/entities';

export interface CreatePharmacyRequest {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  license_number?: string;
}

export class PharmacyService {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async createPharmacy(pharmacyData: CreatePharmacyRequest): Promise<Pharmacy> {
    try {
      console.log('🏥 PharmacyService: Starting pharmacy creation...');
      
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        console.log('❌ PharmacyService: Database service not available');
        throw new Error('Database service not available');
      }

      console.log('✅ Creating pharmacy directly...');

      // Create pharmacy in database
      const { data, error } = await supabase
        .from('pharmacies')
        .insert({
          name: pharmacyData.name,
          contact_person: pharmacyData.contact_person,
          phone: pharmacyData.phone,
          email: pharmacyData.email,
          address: pharmacyData.address || '',
          city: pharmacyData.city || '',
          state: pharmacyData.state || '',
          country: pharmacyData.country || 'Tanzania',
          postal_code: pharmacyData.postal_code || '',
          license_number: pharmacyData.license_number || '',
          delivery_radius: 10, // Default 10km
          delivery_fee: 0, // Default free delivery
          min_order_amount: 0, // Default no minimum
          active: true,
          verified: false // Will be verified later
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating pharmacy:', error);
        throw new Error('Failed to create pharmacy');
      }

      this.logger.info(`Pharmacy created successfully: ${data.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error in createPharmacy:', error);
      throw error;
    }
  }

  async getPharmacyByEmail(email: string): Promise<Pharmacy | null> {
    try {
      console.log('🔍 PharmacyService.getPharmacyByEmail: Starting query for email:', email);
      
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        console.log('❌ PharmacyService.getPharmacyByEmail: Database service not available');
        throw new Error('Database service not available');
      }

      console.log('📊 PharmacyService.getPharmacyByEmail: About to execute Supabase query...');
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid hanging

      console.log('📊 PharmacyService.getPharmacyByEmail: Query completed. Data:', data, 'Error:', error);

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('✅ PharmacyService.getPharmacyByEmail: No pharmacy found (expected)');
          return null; // Pharmacy not found
        }
        console.log('❌ PharmacyService.getPharmacyByEmail: Database error:', error);
        this.logger.error('Error fetching pharmacy by email:', error);
        throw new Error('Failed to fetch pharmacy');
      }

      console.log('✅ PharmacyService.getPharmacyByEmail: Pharmacy found:', data);
      return data;
    } catch (error) {
      console.log('❌ PharmacyService.getPharmacyByEmail: Exception occurred:', error);
      this.logger.error('Error in getPharmacyByEmail:', error);
      throw error;
    }
  }

  async getPharmacyById(id: string): Promise<Pharmacy | null> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }

      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Pharmacy not found
        }
        this.logger.error('Error fetching pharmacy by ID:', error);
        throw new Error('Failed to fetch pharmacy');
      }

      return data;
    } catch (error) {
      this.logger.error('Error in getPharmacyById:', error);
      throw error;
    }
  }

  async updatePharmacy(id: string, updates: Partial<Pharmacy>): Promise<Pharmacy> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }

      const { data, error } = await supabase
        .from('pharmacies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating pharmacy:', error);
        throw new Error('Failed to update pharmacy');
      }

      this.logger.info(`Pharmacy updated successfully: ${data.name}`);
      return data;
    } catch (error) {
      this.logger.error('Error in updatePharmacy:', error);
      throw error;
    }
  }

  async deletePharmacy(id: string): Promise<void> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }

      const { error } = await supabase
        .from('pharmacies')
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error deleting pharmacy:', error);
        throw new Error('Failed to delete pharmacy');
      }

      this.logger.info(`Pharmacy deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Error in deletePharmacy:', error);
      throw error;
    }
  }

  async getPharmacies(page: number = 1, limit: number = 20): Promise<{ data: Pharmacy[]; total: number }> {
    try {
      const supabase = this.databaseService.supabase;
      if (!supabase) {
        throw new Error('Database service not available');
      }

      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        this.logger.error('Error fetching pharmacies:', error);
        throw new Error('Failed to fetch pharmacies');
      }

      return {
        data: data || [],
        total: count || 0
      };
    } catch (error) {
      this.logger.error('Error in getPharmacies:', error);
      throw error;
    }
  }
}
