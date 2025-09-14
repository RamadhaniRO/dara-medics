import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { LoggerService } from '../../core/logger/logger.service';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    pharmacyId?: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  pharmacyId?: string;
  iat?: number;
  exp?: number;
}

export class AuthMiddleware {
  private logger: LoggerService;
  private jwtSecret: string;

  constructor() {
    this.logger = new LoggerService();
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  }

  public authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access token required'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Access token required'
        });
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        pharmacyId: decoded.pharmacyId
      };

      this.logger.info('User authenticated', { 
        userId: decoded.id, 
        email: decoded.email, 
        role: decoded.role 
      });

      next();
    } catch (error) {
      this.logger.error('Authentication failed', { error });
      
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          success: false,
          message: 'Invalid access token'
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          success: false,
          message: 'Access token expired'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Authentication error'
        });
      }
    }
  };

  public authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
          return;
        }

        if (!roles.includes(req.user.role)) {
          this.logger.warn('Authorization failed', { 
            userId: req.user.id, 
            userRole: req.user.role, 
            requiredRoles: roles 
          });
          
          res.status(403).json({
            success: false,
            message: 'Insufficient permissions'
          });
          return;
        }

        this.logger.info('User authorized', { 
          userId: req.user.id, 
          role: req.user.role 
        });

        next();
      } catch (error) {
        this.logger.error('Authorization failed', { error });
        res.status(500).json({
          success: false,
          message: 'Authorization error'
        });
      }
    };
  };

  public optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, continue without authentication
        next();
        return;
      }

      const token = authHeader.substring(7);
      
      if (!token) {
        // No token provided, continue without authentication
        next();
        return;
      }

      // Try to verify JWT token
      try {
        const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
        
        // Attach user info to request if token is valid
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          pharmacyId: decoded.pharmacyId
        };

        this.logger.info('Optional authentication successful', { 
          userId: decoded.id, 
          email: decoded.email 
        });
      } catch (tokenError) {
        // Token is invalid, but we continue without authentication
        this.logger.warn('Optional authentication failed, continuing without auth', { tokenError });
      }

      next();
    } catch (error) {
      this.logger.error('Optional authentication error', { error });
      // Continue without authentication on error
      next();
    }
  };

  public generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: expiresIn,
      issuer: 'medsupply-wa',
      audience: 'medsupply-wa-users'
    } as jwt.SignOptions);
  }

  public verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as JWTPayload;
    } catch (error) {
      this.logger.error('Token verification failed', { error });
      return null;
    }
  }

  public refreshToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, { ignoreExpiration: true }) as JWTPayload;
      
      // Generate new token with same payload
      return this.generateToken({
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        pharmacyId: decoded.pharmacyId
      });
    } catch (error) {
      this.logger.error('Token refresh failed', { error });
      return null;
    }
  }
}

// Create singleton instance
const authMiddlewareInstance = new AuthMiddleware();

// Export middleware functions
export const authMiddleware = authMiddlewareInstance.authenticate;
export const authenticate = authMiddlewareInstance.authenticate;
export const authorize = authMiddlewareInstance.authorize;
export const optionalAuth = authMiddlewareInstance.optionalAuth;
export const generateToken = authMiddlewareInstance.generateToken.bind(authMiddlewareInstance);
export const verifyToken = authMiddlewareInstance.verifyToken.bind(authMiddlewareInstance);
export const refreshToken = authMiddlewareInstance.refreshToken.bind(authMiddlewareInstance);