import { Router, Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { PharmacyService } from '../../services/pharmacy/pharmacy.service';
import { DatabaseService } from '../../core/database/database.service';
import { LoggerService } from '../../core/logger/logger.service';

// Function to create auth routes with initialized services
export function createAuthRoutes(databaseService: DatabaseService, logger: LoggerService) {
  console.log('🔧 Creating auth routes with services...');
  console.log('📊 Database service available:', !!databaseService);
  console.log('📊 Logger service available:', !!logger);
  
  const router = Router();

  // Use the initialized services
  const userService = new UserService(databaseService, logger);
  const pharmacyService = new PharmacyService(databaseService, logger);
  
  console.log('✅ Services created successfully');

  // Test endpoint to verify routes are working
  router.get('/test', (_req: Request, res: Response) => {
    console.log('🧪 Test endpoint hit!');
    res.json({ message: 'Auth routes are working!' });
  });

  // Register endpoint - Simple and robust approach
  router.post('/register', async (req: Request, res: Response) => {
    console.log('=== REGISTRATION STARTED ===');
    console.log('🕐 Timestamp:', new Date().toISOString());
    console.log('📨 Request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    });
    console.log('📊 UserService available:', !!userService);
    console.log('📊 PharmacyService available:', !!pharmacyService);
    console.log('📊 Database service available:', !!databaseService);
    console.log('📊 Logger service available:', !!logger);
    
    try {
      console.log('🔍 Step 1: Extracting request body...');
      const { pharmacyName, email, password, confirmPassword } = req.body;
      console.log('📝 Extracted data:', { pharmacyName, email, password: password ? '***' : 'undefined', confirmPassword: confirmPassword ? '***' : 'undefined' });

      // Basic validation
      console.log('🔍 Step 2: Validating required fields...');
      if (!pharmacyName || !email || !password || !confirmPassword) {
        console.log('❌ Missing required fields:', { pharmacyName: !!pharmacyName, email: !!email, password: !!password, confirmPassword: !!confirmPassword });
        return res.status(400).json({ error: 'All fields are required' });
      }

      console.log('🔍 Step 3: Validating password match...');
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      console.log('🔍 Step 4: Validating password length...');
      if (password.length < 6) {
        console.log('❌ Password too short:', password.length);
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      console.log('✅ All validations passed');

      // Check if user already exists
      console.log('🔍 Step 5: Checking if user exists...');
      console.log('📧 Checking email:', email);
      const existingUser = await userService.getUserByEmail(email);
      console.log('👤 Existing user result:', existingUser ? 'User found' : 'No user found');
      
      if (existingUser) {
        console.log('❌ User already exists with ID:', existingUser.id);
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      console.log('✅ No existing user found');

      // Create pharmacy first
      console.log('🔍 Step 6: Creating pharmacy...');
      const pharmacyData = {
        name: pharmacyName,
        contact_person: pharmacyName,
        phone: '',
        email: email,
        address: '',
        city: '',
        state: '',
        country: 'Tanzania',
        postal_code: '',
        license_number: `LIC-${Date.now()}`,
        delivery_radius: 50,
        delivery_fee: 0,
        min_order_amount: 0,
        active: true,
        verified: false
      };
      console.log('🏥 Pharmacy data:', pharmacyData);

      const newPharmacy = await pharmacyService.createPharmacy(pharmacyData);
      console.log('✅ Pharmacy created successfully:', { id: newPharmacy.id, name: newPharmacy.name });

      // Create user
      console.log('🔍 Step 7: Creating user...');
      const userData = {
        email: email,
        name: pharmacyName,
        password: password,
        role: 'pharmacy' as const,
        pharmacy_id: newPharmacy.id,
        phone: ''
      };
      console.log('👤 User data:', { ...userData, password: '***' });

      const newUser = await userService.createUser(userData);
      console.log('✅ User created successfully:', { id: newUser.id, name: newUser.name, email: newUser.email });

      console.log('🎉 Registration completed successfully');
      
      const response = {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          pharmacy_id: newUser.pharmacy_id
        },
        pharmacy: {
          id: newPharmacy.id,
          name: newPharmacy.name,
          email: newPharmacy.email
        }
      };
      
      console.log('📤 Sending success response:', response);
      return res.status(201).json(response);

    } catch (error) {
      console.log('❌ Registration error occurred:', error);
      console.log('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      });
      
      logger.error('Registration error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      const errorResponse = { 
        success: false,
        error: errorMessage 
      };
      
      console.log('📤 Sending error response:', errorResponse);
      return res.status(500).json(errorResponse);
    }
  });

  // Login endpoint
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Use user service for authentication
      const result = await userService.login({ email, password });

      // Return user data and token
      return res.status(200).json({
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          pharmacy: result.user.pharmacy_id
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Internal server error';
      return res.status(401).json({ error: message });
    }
  });

  // Token validation endpoint
  router.get('/validate', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Get user by ID from database
        const user = await userService.getUserById(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        return res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          pharmacy: user.pharmacy_id
        });
      } catch (jwtError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      logger.error('Token validation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
