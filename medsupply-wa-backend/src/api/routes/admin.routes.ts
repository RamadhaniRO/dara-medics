import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Get system overview and statistics
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

    // Fetch dashboard metrics
    const [
      todayOrdersResult,
      yesterdayOrdersResult,
      todayRevenueResult,
      yesterdayRevenueResult,
      activeConversationsResult,
      pendingEscalationsResult
    ] = await Promise.allSettled([
      // Today's orders count
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString()),
      
      // Yesterday's orders count
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .gte('created_at', startOfYesterday.toISOString())
        .lte('created_at', endOfYesterday.toISOString()),
      
      // Today's revenue
      supabase
        .from('orders')
        .select('final_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString()),
      
      // Yesterday's revenue
      supabase
        .from('orders')
        .select('final_amount')
        .eq('payment_status', 'paid')
        .gte('created_at', startOfYesterday.toISOString())
        .lte('created_at', endOfYesterday.toISOString()),
      
      // Active conversations
      supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('status', 'active'),
      
      // Pending escalations (conversations that need attention)
      supabase
        .from('conversations')
        .select('id', { count: 'exact' })
        .eq('status', 'escalated')
    ]);

    // Process results
    const todayOrders = todayOrdersResult.status === 'fulfilled' ? (todayOrdersResult.value.count || 0) : 0;
    const yesterdayOrders = yesterdayOrdersResult.status === 'fulfilled' ? (yesterdayOrdersResult.value.count || 0) : 0;
    const todayRevenue = todayRevenueResult.status === 'fulfilled' 
      ? (todayRevenueResult.value.data?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0)
      : 0;
    const yesterdayRevenue = yesterdayRevenueResult.status === 'fulfilled'
      ? (yesterdayRevenueResult.value.data?.reduce((sum, order) => sum + (order.final_amount || 0), 0) || 0)
      : 0;
    const activeConversations = activeConversationsResult.status === 'fulfilled' ? (activeConversationsResult.value.count || 0) : 0;
    const pendingEscalations = pendingEscalationsResult.status === 'fulfilled' ? (pendingEscalationsResult.value.count || 0) : 0;

    // Calculate percentage changes
    const ordersChange = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100) : 0;
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;
    const conversationsChange = 8; // Mock value for now
    const escalationsChange = -3; // Mock value for now

    const dashboardData = {
      metrics: {
        totalOrdersToday: {
          value: todayOrders,
          change: ordersChange,
          trend: ordersChange >= 0 ? 'up' : 'down'
        },
        activeConversations: {
          value: activeConversations,
          change: conversationsChange,
          trend: conversationsChange >= 0 ? 'up' : 'down'
        },
        pendingEscalations: {
          value: pendingEscalations,
          change: escalationsChange,
          trend: escalationsChange >= 0 ? 'up' : 'down'
        },
        revenueToday: {
          value: todayRevenue,
          change: revenueChange,
          trend: revenueChange >= 0 ? 'up' : 'down'
        }
      },
      systemHealth: 'healthy',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get system health status
router.get('/health', async (req: Request, res: Response) => {
  try {
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get detailed health information
    const healthChecks = await Promise.allSettled([
      // Database health
      supabase.from('users').select('id').limit(1),
      
      // Check if we can access orders table
      supabase.from('orders').select('id').limit(1),
      
      // Check if we can access conversations table
      supabase.from('conversations').select('id').limit(1),
      
      // Check if we can access pharmacies table
      supabase.from('pharmacies').select('id').limit(1)
    ]);

    const dbHealthy = healthChecks[0].status === 'fulfilled';
    const ordersHealthy = healthChecks[1].status === 'fulfilled';
    const conversationsHealthy = healthChecks[2].status === 'fulfilled';
    const pharmaciesHealthy = healthChecks[3].status === 'fulfilled';

    // Determine overall health status
    const allHealthy = dbHealthy && ordersHealthy && conversationsHealthy && pharmaciesHealthy;
    const overallStatus = allHealthy ? 'healthy' : 'degraded';

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        orders: ordersHealthy ? 'healthy' : 'unhealthy',
        conversations: conversationsHealthy ? 'healthy' : 'unhealthy',
        pharmacies: pharmaciesHealthy ? 'healthy' : 'unhealthy',
        whatsapp: 'connected', // Mock for now
        agents: 'running' // Mock for now
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(allHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Failed to get system health' 
    });
  }
});

// Get WhatsApp conversations data
router.get('/whatsapp/conversations', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, agentId } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build query with joins to get pharmacy and agent information
    let query = supabase
      .from('conversations')
      .select(`
        id,
        pharmacy_id,
        whatsapp_number,
        customer_name,
        status,
        last_message_at,
        agent_id,
        tags,
        notes,
        created_at,
        updated_at,
        pharmacies(name, phone, email, city, state),
        users!conversations_agent_id_fkey(name, email)
      `)
      .order('last_message_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (agentId) {
      query = query.eq('agent_id', agentId);
    }

    const { data: conversations, error, count } = await query;

    if (error) {
      console.error('Conversations query error:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    const result = {
      data: conversations || [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / parseInt(limit as string))
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Conversations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a specific conversation
router.get('/whatsapp/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        whatsapp_message_id,
        direction,
        message_type,
        content,
        media_url,
        media_type,
        status,
        delivered_at,
        read_at,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) {
      console.error('Messages query error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    const result = {
      data: messages || [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: messages?.length || 0
      }
    };
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    
    // This would create a user through the user service
    const newUser = {
      id: 'user-123',
      ...userData,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // This would update the user through the user service
    const updatedUser = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id: _id } = req.params;
    
    // This would delete the user through the user service
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get system configuration
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const config = {
      whatsapp: {
        apiKey: '***',
        phoneNumber: '+1234567890',
        webhookUrl: 'https://api.medsupply-wa.com/webhook'
      },
      payment: {
        mpesa: {
          enabled: true,
          apiKey: '***'
        },
        airtel: {
          enabled: true,
          apiKey: '***'
        },
        tigo: {
          enabled: false,
          apiKey: '***'
        }
      },
      llm: {
        provider: 'ollama',
        model: 'llama2',
        apiKey: '***'
      }
    };
    
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system configuration' });
  }
});

// Update system configuration
router.put('/config', async (req: Request, res: Response) => {
  try {
    const { } = req.body;
    
    // This would update the system configuration
    res.status(200).json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Get audit logs
router.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // This would fetch audit logs
    const logs = {
      data: [],
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: 0
      }
    };
    
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get agent performance metrics
router.get('/agents/performance', async (req: Request, res: Response) => {
  try {
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get date range for this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch agent performance data
    const [
      agentsResult,
      conversationsResult,
      messagesResult,
      resolutionStatsResult
    ] = await Promise.allSettled([
      // Get all agents (users with role 'agent' or 'admin')
      supabase
        .from('users')
        .select('id, name, email, role')
        .in('role', ['agent', 'admin']),
      
      // Get conversations assigned to agents this week
      supabase
        .from('conversations')
        .select('id, agent_id, status, created_at, last_message_at')
        .gte('created_at', startOfWeek.toISOString())
        .not('agent_id', 'is', null),
      
      // Get messages from agents this week for response time calculation
      supabase
        .from('messages')
        .select('id, conversation_id, sender_id, created_at, message_type')
        .eq('sender_type', 'agent')
        .gte('created_at', startOfWeek.toISOString()),
      
      // Get resolution statistics
      supabase
        .from('conversations')
        .select('status', { count: 'exact' })
        .gte('created_at', startOfWeek.toISOString())
    ]);

    const agents = agentsResult.status === 'fulfilled' ? (agentsResult.value.data || []) : [];
    const conversations = conversationsResult.status === 'fulfilled' ? (conversationsResult.value.data || []) : [];
    const messages = messagesResult.status === 'fulfilled' ? (messagesResult.value.data || []) : [];
    const resolutionStats = resolutionStatsResult.status === 'fulfilled' ? (resolutionStatsResult.value.data || []) : [];

    // Calculate agent performance metrics
    const agentPerformance = agents.map(agent => {
      const agentConversations = conversations.filter(conv => conv.agent_id === agent.id);
      const agentMessages = messages.filter(msg => msg.sender_id === agent.id);
      
      // Calculate average response time (simplified)
      const responseTimes = agentMessages.map(msg => {
        // Mock response time calculation - in real implementation, 
        // you'd calculate time between customer message and agent response
        return Math.random() * 3 + 0.5; // 0.5 to 3.5 minutes
      });
      
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      // Calculate resolution rate
      const resolvedConversations = agentConversations.filter(conv => conv.status === 'resolved').length;
      const resolutionRate = agentConversations.length > 0 
        ? Math.round((resolvedConversations / agentConversations.length) * 100)
        : 0;

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        conversations: agentConversations.length,
        avgResponse: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}m` : '0m',
        resolutionRate: resolutionRate,
        status: 'online', // Mock status for now
        avatar: agent.name.split(' ').map(n => n[0]).join('').toUpperCase()
      };
    });

    // Calculate overall resolution statistics
    const totalConversations = conversations.length;
    const resolvedCount = conversations.filter(conv => conv.status === 'resolved').length;
    const escalatedCount = conversations.filter(conv => conv.status === 'escalated').length;
    const pendingCount = conversations.filter(conv => conv.status === 'active').length;
    const failedCount = conversations.filter(conv => conv.status === 'failed').length;

    const resolutionData = [
      { 
        label: 'Resolved', 
        value: totalConversations > 0 ? Math.round((resolvedCount / totalConversations) * 100) : 0, 
        color: '#3b82f6', 
        count: resolvedCount 
      },
      { 
        label: 'Escalated', 
        value: totalConversations > 0 ? Math.round((escalatedCount / totalConversations) * 100) : 0, 
        color: '#f59e0b', 
        count: escalatedCount 
      },
      { 
        label: 'Pending', 
        value: totalConversations > 0 ? Math.round((pendingCount / totalConversations) * 100) : 0, 
        color: '#10b981', 
        count: pendingCount 
      },
      { 
        label: 'Failed', 
        value: totalConversations > 0 ? Math.round((failedCount / totalConversations) * 100) : 0, 
        color: '#ef4444', 
        count: failedCount 
      }
    ];

    // Response time data for chart
    const responseTimeData = agentPerformance.map(agent => ({
      name: agent.name.split(' ')[0], // First name only
      time: parseFloat(agent.avgResponse.replace('m', ''))
    }));

    const performance = {
      totalConversations,
      averageResponseTime: agentPerformance.length > 0 
        ? agentPerformance.reduce((sum, agent) => sum + parseFloat(agent.avgResponse.replace('m', '')), 0) / agentPerformance.length
        : 0,
      resolutionRate: totalConversations > 0 ? Math.round((resolvedCount / totalConversations) * 100) : 0,
      agentBreakdown: agentPerformance,
      resolutionData,
      responseTimeData,
      period: 'This Week',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(performance);
  } catch (error) {
    console.error('Agent performance error:', error);
    res.status(500).json({ error: 'Failed to fetch agent performance' });
  }
});

// Get system analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get date range for analytics (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Fetch analytics data
    const [
      ordersResult,
      revenueResult,
      customersResult,
      conversationsResult
    ] = await Promise.allSettled([
      // Get orders analytics
      supabase
        .from('orders')
        .select('id, status, created_at, final_amount')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Get revenue analytics
      supabase
        .from('orders')
        .select('final_amount, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Get customer analytics
      supabase
        .from('conversations')
        .select('id, whatsapp_number, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString()),
      
      // Get conversation analytics
      supabase
        .from('conversations')
        .select('id, status, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
    ]);

    const orders = ordersResult.status === 'fulfilled' ? (ordersResult.value.data || []) : [];
    const revenue = revenueResult.status === 'fulfilled' ? (revenueResult.value.data || []) : [];
    const customers = customersResult.status === 'fulfilled' ? (customersResult.value.data || []) : [];
    const conversations = conversationsResult.status === 'fulfilled' ? (conversationsResult.value.data || []) : [];

    // Calculate order statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    const pendingOrders = orders.filter(order => ['pending', 'confirmed', 'processing'].includes(order.status)).length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    // Calculate revenue statistics
    const totalRevenue = revenue.reduce((sum, order) => sum + (order.final_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate customer statistics
    const uniqueCustomers = new Set(customers.map(customer => customer.whatsapp_number)).size;
    const newCustomers = customers.filter(customer => {
      const customerDate = new Date(customer.created_at);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return customerDate >= sevenDaysAgo;
    }).length;

    // Calculate conversation statistics
    const activeConversations = conversations.filter(conv => conv.status === 'active').length;

    // Generate revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      
      const dayRevenue = revenue
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate >= dayStart && orderDate <= dayEnd;
        })
        .reduce((sum, order) => sum + (order.final_amount || 0), 0);
      
      revenueTrend.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue
      });
    }

    const analytics = {
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders
      },
      revenue: {
        total: totalRevenue,
        average: averageOrderValue,
        trend: revenueTrend
      },
      customers: {
        total: uniqueCustomers,
        new: newCustomers,
        active: activeConversations
      },
      conversations: {
        total: conversations.length,
        active: activeConversations,
        resolved: conversations.filter(conv => conv.status === 'resolved').length
      },
      period: 'Last 30 Days',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get user settings/preferences
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get user profile information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at,
        pharmacies(
          id,
          name,
          phone,
          email,
          address,
          city,
          state,
          country,
          logo_url
        )
      `)
      .eq('id', userId || 'default-user-id')
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('User query error:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Get system settings
    const { data: systemSettings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value, description')
      .eq('is_public', true);

    if (settingsError) {
      console.error('Settings query error:', settingsError);
      return res.status(500).json({ error: 'Failed to fetch system settings' });
    }

    // Format settings data
    const settings = {
      profile: {
        pharmacyName: user?.pharmacies?.name || 'MedSupply-WA Pharmacy',
        contactPerson: user?.name || 'Dr. Sarah Johnson',
        email: user?.email || 'pharmacy@medsupply-wa.com',
        phone: user?.phone || '+234 801 234 5678',
        address: user?.pharmacies?.address || '123 Medical District, Lagos, Nigeria',
        logoUrl: user?.pharmacies?.logo_url || null
      },
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: user?.updated_at || new Date().toISOString()
      },
      notifications: {
        orderUpdates: true,
        paymentAlerts: true,
        inventoryAlerts: true,
        systemUpdates: true,
        marketingEmails: false
      },
      billing: {
        billingAddress: user?.pharmacies?.address || '123 Medical District, Lagos, Nigeria',
        taxId: 'TAX-123456789',
        paymentMethods: [
          {
            id: 'pm_1',
            last4: '1234',
            expiryMonth: 12,
            expiryYear: 2025,
            isPrimary: true
          }
        ]
      },
      integrations: {
        whatsappBusiness: { connected: true, status: 'connected' },
        quickbooks: { connected: false, status: 'available' },
        googleAnalytics: { connected: false, status: 'available' },
        mailchimp: { connected: false, status: 'available' }
      },
      systemSettings: systemSettings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {}) || {}
    };

    res.status(200).json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update user settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const { userId, settingsType, data } = req.body;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    let result;

    switch (settingsType) {
      case 'profile':
        // Update user and pharmacy information
        if (data.pharmacyName || data.contactPerson || data.email || data.phone || data.address) {
          // Update user
          const userUpdate: any = {};
          if (data.contactPerson) userUpdate.name = data.contactPerson;
          if (data.email) userUpdate.email = data.email;
          if (data.phone) userUpdate.phone = data.phone;

          if (Object.keys(userUpdate).length > 0) {
            const { error: userError } = await supabase
              .from('users')
              .update(userUpdate)
              .eq('id', userId || 'default-user-id');

            if (userError) {
              console.error('User update error:', userError);
              return res.status(500).json({ error: 'Failed to update user profile' });
            }
          }

          // Update pharmacy
          const pharmacyUpdate: any = {};
          if (data.pharmacyName) pharmacyUpdate.name = data.pharmacyName;
          if (data.address) pharmacyUpdate.address = data.address;

          if (Object.keys(pharmacyUpdate).length > 0) {
            const { error: pharmacyError } = await supabase
              .from('pharmacies')
              .update(pharmacyUpdate)
              .eq('id', userId || 'default-user-id');

            if (pharmacyError) {
              console.error('Pharmacy update error:', pharmacyError);
              return res.status(500).json({ error: 'Failed to update pharmacy profile' });
            }
          }
        }
        result = { message: 'Profile updated successfully' };
        break;

      case 'security':
        // Update password (would need proper password hashing in production)
        result = { message: 'Security settings updated successfully' };
        break;

      case 'notifications':
        // Update notification preferences (would store in user preferences table)
        result = { message: 'Notification preferences updated successfully' };
        break;

      case 'billing':
        // Update billing information
        const billingUpdate: any = {};
        if (data.billingAddress) billingUpdate.address = data.billingAddress;
        if (data.taxId) billingUpdate.tax_id = data.taxId;

        if (Object.keys(billingUpdate).length > 0) {
          const { error: billingError } = await supabase
            .from('pharmacies')
            .update(billingUpdate)
            .eq('id', userId || 'default-user-id');

          if (billingError) {
            console.error('Billing update error:', billingError);
            return res.status(500).json({ error: 'Failed to update billing information' });
          }
        }
        result = { message: 'Billing information updated successfully' };
        break;

      case 'integrations':
        // Update integration settings
        result = { message: 'Integration settings updated successfully' };
        break;

      default:
        return res.status(400).json({ error: 'Invalid settings type' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get user profile data
router.get('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Get user profile information with pharmacy data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        status,
        created_at,
        updated_at,
        pharmacies(
          id,
          name,
          phone,
          email,
          address,
          city,
          state,
          country,
          logo_url
        )
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User profile query error:', userError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Get user statistics (orders, payments, etc.)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('pharmacy_id', user.pharmacies?.id || userId);

    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('phone_number', user.phone);

    // Calculate statistics
    const totalOrders = orders?.length || 0;
    const totalSpent = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
    const loyaltyPoints = Math.floor(totalSpent / 100); // 1 point per $100 spent
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';

    // Format profile data
    const profileData = {
      user: {
        id: user.id,
        firstName: user.name?.split(' ')[0] || 'Unknown',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        phone: user.phone,
        pharmacy: user.pharmacies?.name || 'Unknown Pharmacy',
        role: user.role || 'User',
        location: user.pharmacies?.city && user.pharmacies?.state 
          ? `${user.pharmacies.city}, ${user.pharmacies.state}`
          : 'Unknown Location',
        joinDate: memberSince,
        lastLogin: user.updated_at ? new Date(user.updated_at).toLocaleString() : 'Never',
        avatar: user.pharmacies?.logo_url || null,
        status: user.status || 'active'
      },
      stats: {
        totalOrders,
        totalSpent,
        loyaltyPoints,
        memberSince: user.created_at ? 
          Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)) + ' year(s)' : 
          'Unknown'
      },
      preferences: {
        notifications: true,
        emailUpdates: true,
        smsAlerts: false,
        darkMode: false
      }
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, pharmacy, location } = req.body;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    // Update user information
    const userUpdate: any = {};
    if (firstName || lastName) {
      userUpdate.name = `${firstName || ''} ${lastName || ''}`.trim();
    }
    if (email) userUpdate.email = email;
    if (phone) userUpdate.phone = phone;

    if (Object.keys(userUpdate).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(userUpdate)
        .eq('id', userId);

      if (userError) {
        console.error('User update error:', userError);
        return res.status(500).json({ error: 'Failed to update user profile' });
      }
    }

    // Update pharmacy information if provided
    if (pharmacy || location) {
      const pharmacyUpdate: any = {};
      if (pharmacy) pharmacyUpdate.name = pharmacy;
      if (location) {
        const [city, state] = location.split(', ');
        pharmacyUpdate.city = city;
        pharmacyUpdate.state = state;
      }

      if (Object.keys(pharmacyUpdate).length > 0) {
        const { error: pharmacyError } = await supabase
          .from('pharmacies')
          .update(pharmacyUpdate)
          .eq('id', userId);

        if (pharmacyError) {
          console.error('Pharmacy update error:', pharmacyError);
          return res.status(500).json({ error: 'Failed to update pharmacy information' });
        }
      }
    }

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get compliance data
router.get('/compliance', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, status, priority } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock compliance data since we don't have a compliance table
    // In a real implementation, you would have a compliance_requirements table
    const mockComplianceItems = [
      {
        id: 'COMP-001',
        title: 'Pharmaceutical License Renewal',
        category: 'regulatory',
        status: 'compliant',
        priority: 'high',
        dueDate: '2024-03-15',
        lastUpdated: '2024-01-10',
        assignedTo: 'Dr. Sarah Johnson',
        description: 'Annual renewal of pharmaceutical wholesale license',
        riskLevel: 'high'
      },
      {
        id: 'COMP-002',
        title: 'Quality Control Documentation',
        category: 'quality',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-02-28',
        lastUpdated: '2024-01-12',
        assignedTo: 'Michael Chen',
        description: 'Update quality control procedures and documentation',
        riskLevel: 'medium'
      },
      {
        id: 'COMP-003',
        title: 'Safety Training Records',
        category: 'safety',
        status: 'non_compliant',
        priority: 'critical',
        dueDate: '2024-01-31',
        lastUpdated: '2024-01-08',
        assignedTo: 'Emily Rodriguez',
        description: 'Complete safety training for all staff members',
        riskLevel: 'high'
      },
      {
        id: 'COMP-004',
        title: 'Inventory Audit Report',
        category: 'documentation',
        status: 'review',
        priority: 'medium',
        dueDate: '2024-02-15',
        lastUpdated: '2024-01-14',
        assignedTo: 'David Kim',
        description: 'Quarterly inventory audit and compliance report',
        riskLevel: 'medium'
      },
      {
        id: 'COMP-005',
        title: 'Data Protection Compliance',
        category: 'regulatory',
        status: 'compliant',
        priority: 'high',
        dueDate: '2024-05-25',
        lastUpdated: '2024-01-05',
        assignedTo: 'Lisa Wang',
        description: 'GDPR and data protection compliance review',
        riskLevel: 'high'
      },
      {
        id: 'COMP-006',
        title: 'Temperature Monitoring System',
        category: 'quality',
        status: 'compliant',
        priority: 'medium',
        dueDate: '2024-04-10',
        lastUpdated: '2024-01-15',
        assignedTo: 'James Wilson',
        description: 'Calibrate and verify temperature monitoring systems',
        riskLevel: 'medium'
      },
      {
        id: 'COMP-007',
        title: 'Staff Certification Renewal',
        category: 'safety',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-02-20',
        lastUpdated: '2024-01-11',
        assignedTo: 'Maria Garcia',
        description: 'Renew pharmaceutical technician certifications',
        riskLevel: 'high'
      },
      {
        id: 'COMP-008',
        title: 'Emergency Response Plan',
        category: 'safety',
        status: 'compliant',
        priority: 'medium',
        dueDate: '2024-06-30',
        lastUpdated: '2024-01-03',
        assignedTo: 'Robert Brown',
        description: 'Update emergency response procedures',
        riskLevel: 'medium'
      }
    ];

    // Apply filters
    let filteredItems = mockComplianceItems;
    
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => item.status === status);
    }
    
    if (priority && priority !== 'all') {
      filteredItems = filteredItems.filter(item => item.priority === priority);
    }

    // Apply pagination
    const paginatedItems = filteredItems.slice(offset, offset + parseInt(limit as string));

    // Calculate compliance statistics
    const totalItems = mockComplianceItems.length;
    const compliantItems = mockComplianceItems.filter(item => item.status === 'compliant').length;
    const nonCompliantItems = mockComplianceItems.filter(item => item.status === 'non_compliant').length;
    const pendingItems = mockComplianceItems.filter(item => item.status === 'pending').length;
    const complianceRate = (compliantItems / totalItems) * 100;

    // Calculate category-wise compliance
    const categoryStats = [
      { category: 'regulatory', compliant: mockComplianceItems.filter(i => i.category === 'regulatory' && i.status === 'compliant').length, total: mockComplianceItems.filter(i => i.category === 'regulatory').length },
      { category: 'quality', compliant: mockComplianceItems.filter(i => i.category === 'quality' && i.status === 'compliant').length, total: mockComplianceItems.filter(i => i.category === 'quality').length },
      { category: 'safety', compliant: mockComplianceItems.filter(i => i.category === 'safety' && i.status === 'compliant').length, total: mockComplianceItems.filter(i => i.category === 'safety').length },
      { category: 'documentation', compliant: mockComplianceItems.filter(i => i.category === 'documentation' && i.status === 'compliant').length, total: mockComplianceItems.filter(i => i.category === 'documentation').length }
    ];

    const result = {
      data: paginatedItems,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / parseInt(limit as string))
      },
      statistics: {
        totalItems,
        compliantItems,
        nonCompliantItems,
        pendingItems,
        complianceRate: Math.round(complianceRate * 10) / 10
      },
      categoryStats
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Compliance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch compliance data' });
  }
});

// Get catalog/products data
router.get('/catalog', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock catalog data since we don't have a products table
    // In a real implementation, you would have a products table
    const mockProducts = [
      {
        id: 'PROD-001',
        name: 'Paracetamol 500mg',
        category: 'Pain Relief',
        price: 15.50,
        stock: 150,
        status: 'active',
        sales: 45,
        trend: 'up',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'PROD-002',
        name: 'Amoxicillin 250mg',
        category: 'Antibiotics',
        price: 25.75,
        stock: 0,
        status: 'out_of_stock',
        sales: 32,
        trend: 'down',
        lastUpdated: '2024-01-14'
      },
      {
        id: 'PROD-003',
        name: 'Vitamin D3 1000IU',
        category: 'Vitamins',
        price: 18.00,
        stock: 75,
        status: 'active',
        sales: 28,
        trend: 'up',
        lastUpdated: '2024-01-16'
      },
      {
        id: 'PROD-004',
        name: 'Ibuprofen 400mg',
        category: 'Pain Relief',
        price: 12.25,
        stock: 200,
        status: 'active',
        sales: 67,
        trend: 'up',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'PROD-005',
        name: 'Metformin 500mg',
        category: 'Diabetes',
        price: 22.50,
        stock: 45,
        status: 'active',
        sales: 19,
        trend: 'down',
        lastUpdated: '2024-01-13'
      },
      {
        id: 'PROD-006',
        name: 'Omeprazole 20mg',
        category: 'Digestive',
        price: 16.80,
        stock: 0,
        status: 'inactive',
        sales: 0,
        trend: 'down',
        lastUpdated: '2024-01-10'
      },
      {
        id: 'PROD-007',
        name: 'Aspirin 100mg',
        category: 'Pain Relief',
        price: 8.50,
        stock: 300,
        status: 'active',
        sales: 89,
        trend: 'up',
        lastUpdated: '2024-01-16'
      },
      {
        id: 'PROD-008',
        name: 'Ciprofloxacin 500mg',
        category: 'Antibiotics',
        price: 35.00,
        stock: 25,
        status: 'active',
        sales: 15,
        trend: 'up',
        lastUpdated: '2024-01-14'
      },
      {
        id: 'PROD-009',
        name: 'Multivitamin Complex',
        category: 'Vitamins',
        price: 24.99,
        stock: 120,
        status: 'active',
        sales: 42,
        trend: 'up',
        lastUpdated: '2024-01-15'
      },
      {
        id: 'PROD-010',
        name: 'Insulin Glargine',
        category: 'Diabetes',
        price: 85.00,
        stock: 15,
        status: 'active',
        sales: 8,
        trend: 'down',
        lastUpdated: '2024-01-12'
      }
    ];

    // Apply filters
    let filteredProducts = mockProducts;
    
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === category);
    }
    
    if (status && status !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.status === status);
    }

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + parseInt(limit as string));

    // Calculate statistics
    const totalProducts = mockProducts.length;
    const activeProducts = mockProducts.filter(p => p.status === 'active').length;
    const outOfStockProducts = mockProducts.filter(p => p.status === 'out_of_stock').length;
    const totalValue = mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalSales = mockProducts.reduce((sum, p) => sum + p.sales, 0);

    // Calculate category-wise statistics
    const categories = [...new Set(mockProducts.map(p => p.category))];
    const categoryStats = categories.map(cat => {
      const categoryProducts = mockProducts.filter(p => p.category === cat);
      return {
        category: cat,
        count: categoryProducts.length,
        sales: categoryProducts.reduce((sum, p) => sum + p.sales, 0),
        color: cat === 'Pain Relief' ? '#e53e3e' : 
               cat === 'Antibiotics' ? '#3182ce' : 
               cat === 'Vitamins' ? '#38a169' : '#805ad5'
      };
    });

    const result = {
      data: paginatedProducts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / parseInt(limit as string))
      },
      statistics: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalValue: Math.round(totalValue * 100) / 100,
        totalSales
      },
      categoryStats
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Catalog fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch catalog data' });
  }
});

// Get agents monitoring data
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock agent data since we don't have an agents table
    // In a real implementation, you would have an agents table with performance metrics
    const mockAgents = [
      {
        id: 'AGENT-001',
        name: 'Sarah Johnson',
        status: 'online',
        role: 'customer_service',
        performance: {
          responseTime: 2.5,
          satisfaction: 4.8,
          conversations: 45,
          resolutionRate: 95
        },
        currentTask: 'Handling customer inquiry about order #ORD-123',
        lastActive: '2 minutes ago',
        availability: 'available'
      },
      {
        id: 'AGENT-002',
        name: 'Michael Chen',
        status: 'busy',
        role: 'sales',
        performance: {
          responseTime: 1.8,
          satisfaction: 4.9,
          conversations: 32,
          resolutionRate: 98
        },
        currentTask: 'Processing new order from Pharmacy ABC',
        lastActive: '5 minutes ago',
        availability: 'unavailable'
      },
      {
        id: 'AGENT-003',
        name: 'Emily Rodriguez',
        status: 'away',
        role: 'support',
        performance: {
          responseTime: 3.2,
          satisfaction: 4.6,
          conversations: 28,
          resolutionRate: 92
        },
        currentTask: 'Break time',
        lastActive: '15 minutes ago',
        availability: 'in_meeting'
      },
      {
        id: 'AGENT-004',
        name: 'David Kim',
        status: 'offline',
        role: 'customer_service',
        performance: {
          responseTime: 2.1,
          satisfaction: 4.7,
          conversations: 38,
          resolutionRate: 94
        },
        currentTask: 'Off duty',
        lastActive: '2 hours ago',
        availability: 'unavailable'
      },
      {
        id: 'AGENT-005',
        name: 'Lisa Wang',
        status: 'online',
        role: 'sales',
        performance: {
          responseTime: 1.5,
          satisfaction: 4.9,
          conversations: 52,
          resolutionRate: 97
        },
        currentTask: 'Following up with potential customer',
        lastActive: '1 minute ago',
        availability: 'available'
      },
      {
        id: 'AGENT-006',
        name: 'James Wilson',
        status: 'online',
        role: 'customer_service',
        performance: {
          responseTime: 2.8,
          satisfaction: 4.5,
          conversations: 41,
          resolutionRate: 93
        },
        currentTask: 'Resolving payment issue for customer',
        lastActive: '3 minutes ago',
        availability: 'available'
      },
      {
        id: 'AGENT-007',
        name: 'Maria Garcia',
        status: 'busy',
        role: 'support',
        performance: {
          responseTime: 3.5,
          satisfaction: 4.7,
          conversations: 35,
          resolutionRate: 96
        },
        currentTask: 'Technical support for WhatsApp integration',
        lastActive: '8 minutes ago',
        availability: 'unavailable'
      },
      {
        id: 'AGENT-008',
        name: 'Robert Brown',
        status: 'away',
        role: 'sales',
        performance: {
          responseTime: 2.2,
          satisfaction: 4.8,
          conversations: 29,
          resolutionRate: 95
        },
        currentTask: 'Lunch break',
        lastActive: '25 minutes ago',
        availability: 'in_meeting'
      }
    ];

    // Apply filters
    let filteredAgents = mockAgents;
    
    if (status && status !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.status === status);
    }
    
    if (role && role !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.role === role);
    }

    // Apply pagination
    const paginatedAgents = filteredAgents.slice(offset, offset + parseInt(limit as string));

    // Calculate statistics
    const totalAgents = mockAgents.length;
    const onlineAgents = mockAgents.filter(a => a.status === 'online').length;
    const busyAgents = mockAgents.filter(a => a.status === 'busy').length;
    const averageResponseTime = mockAgents.reduce((sum, a) => sum + a.performance.responseTime, 0) / mockAgents.length;
    const averageSatisfaction = mockAgents.reduce((sum, a) => sum + a.performance.satisfaction, 0) / mockAgents.length;
    const totalConversations = mockAgents.reduce((sum, a) => sum + a.performance.conversations, 0);
    const averageResolutionRate = mockAgents.reduce((sum, a) => sum + a.performance.resolutionRate, 0) / mockAgents.length;

    const result = {
      data: paginatedAgents,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredAgents.length,
        totalPages: Math.ceil(filteredAgents.length / parseInt(limit as string))
      },
      statistics: {
        totalAgents,
        onlineAgents,
        busyAgents,
        averageResponseTime: Math.round(averageResponseTime * 10) / 10,
        averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
        totalConversations,
        averageResolutionRate: Math.round(averageResolutionRate * 10) / 10
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Agents fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch agents data' });
  }
});

// Get audit logs data
router.get('/audit', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, status, dateRange } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock audit data since we don't have an audit_logs table
    // In a real implementation, you would have an audit_logs table
    const mockAuditLogs = [
      {
        id: 'AUDIT-001',
        user: 'john.doe@pharmacy.com',
        action: 'User Login',
        resource: 'Authentication System',
        timestamp: '2024-01-16 10:30:15',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        details: 'Successful login from desktop browser',
        category: 'authentication'
      },
      {
        id: 'AUDIT-002',
        user: 'sarah.johnson@pharmacy.com',
        action: 'Data Export',
        resource: 'Customer Database',
        timestamp: '2024-01-16 09:45:22',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
        details: 'Exported customer data to CSV format',
        category: 'data_access'
      },
      {
        id: 'AUDIT-003',
        user: 'michael.chen@pharmacy.com',
        action: 'Password Change',
        resource: 'User Account',
        timestamp: '2024-01-16 08:15:33',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        status: 'success',
        details: 'Password successfully updated',
        category: 'security'
      },
      {
        id: 'AUDIT-004',
        user: 'admin@medsupply-wa.com',
        action: 'System Configuration',
        resource: 'Application Settings',
        timestamp: '2024-01-15 16:20:45',
        ipAddress: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        details: 'Updated payment gateway settings',
        category: 'system_change'
      },
      {
        id: 'AUDIT-005',
        user: 'unknown@external.com',
        action: 'Failed Login Attempt',
        resource: 'Authentication System',
        timestamp: '2024-01-15 14:30:12',
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'failed',
        details: 'Invalid credentials provided',
        category: 'security'
      },
      {
        id: 'AUDIT-006',
        user: 'lisa.wang@pharmacy.com',
        action: 'Order Creation',
        resource: 'Order Management System',
        timestamp: '2024-01-16 11:20:18',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        details: 'Created new order #ORD-456',
        category: 'data_access'
      },
      {
        id: 'AUDIT-007',
        user: 'david.kim@pharmacy.com',
        action: 'Payment Processing',
        resource: 'Payment Gateway',
        timestamp: '2024-01-16 10:45:30',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
        details: 'Processed payment for order #ORD-123',
        category: 'system_change'
      },
      {
        id: 'AUDIT-008',
        user: 'emily.rodriguez@pharmacy.com',
        action: 'User Role Change',
        resource: 'User Management',
        timestamp: '2024-01-15 15:30:25',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        details: 'Updated user role from agent to supervisor',
        category: 'system_change'
      },
      {
        id: 'AUDIT-009',
        user: 'james.wilson@pharmacy.com',
        action: 'Data Backup',
        resource: 'Database System',
        timestamp: '2024-01-15 02:00:00',
        ipAddress: '192.168.1.200',
        userAgent: 'System/Backup Service',
        status: 'success',
        details: 'Automated daily backup completed',
        category: 'system_change'
      },
      {
        id: 'AUDIT-010',
        user: 'unknown@external.com',
        action: 'Suspicious Activity',
        resource: 'Authentication System',
        timestamp: '2024-01-14 18:45:12',
        ipAddress: '203.0.113.46',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'failed',
        details: 'Multiple failed login attempts detected',
        category: 'security'
      }
    ];

    // Apply filters
    let filteredLogs = mockAuditLogs;
    
    if (category && category !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    if (status && status !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }

    // Apply date range filter (simplified - in real implementation, you'd filter by actual dates)
    if (dateRange && dateRange !== 'all') {
      // For demo purposes, we'll just return all logs
      // In real implementation, you'd filter by timestamp based on dateRange
    }

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + parseInt(limit as string));

    // Calculate statistics
    const totalLogs = mockAuditLogs.length;
    const successLogs = mockAuditLogs.filter(l => l.status === 'success').length;
    const failedLogs = mockAuditLogs.filter(l => l.status === 'failed').length;
    const securityLogs = mockAuditLogs.filter(l => l.category === 'security').length;
    const authenticationLogs = mockAuditLogs.filter(l => l.category === 'authentication').length;
    const dataAccessLogs = mockAuditLogs.filter(l => l.category === 'data_access').length;
    const systemChangeLogs = mockAuditLogs.filter(l => l.category === 'system_change').length;

    const result = {
      data: paginatedLogs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / parseInt(limit as string))
      },
      statistics: {
        totalLogs,
        successLogs,
        failedLogs,
        securityLogs,
        authenticationLogs,
        dataAccessLogs,
        systemChangeLogs
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs data' });
  }
});

// Get support tickets data
router.get('/support', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, priority, category } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock support ticket data since we don't have a support_tickets table
    // In a real implementation, you would have a support_tickets table
    const mockTickets = [
      {
        id: 'TICKET-001',
        customer: 'Pharmacy ABC',
        customerPhone: '+234 801 234 5678',
        customerEmail: 'pharmacy.abc@email.com',
        subject: 'Order delivery issue',
        description: 'My order was supposed to arrive yesterday but hasn\'t been delivered yet.',
        priority: 'high',
        status: 'in_progress',
        category: 'order',
        assignedAgent: 'Sarah Johnson',
        createdAt: '2024-01-15 09:30',
        updatedAt: '2024-01-16 10:15',
        responseTime: 45
      },
      {
        id: 'TICKET-002',
        customer: 'Pharmacy XYZ',
        customerPhone: '+234 802 345 6789',
        customerEmail: 'pharmacy.xyz@email.com',
        subject: 'Payment processing error',
        description: 'I\'m unable to process payments through the system.',
        priority: 'urgent',
        status: 'open',
        category: 'billing',
        assignedAgent: 'Michael Chen',
        createdAt: '2024-01-16 11:20',
        updatedAt: '2024-01-16 11:20',
        responseTime: 0
      },
      {
        id: 'TICKET-003',
        customer: 'Pharmacy DEF',
        customerPhone: '+234 803 456 7890',
        customerEmail: 'pharmacy.def@email.com',
        subject: 'System login issues',
        description: 'I can\'t log into my account. Getting authentication errors.',
        priority: 'medium',
        status: 'resolved',
        category: 'technical',
        assignedAgent: 'Emily Rodriguez',
        createdAt: '2024-01-14 14:45',
        updatedAt: '2024-01-15 16:30',
        responseTime: 120
      },
      {
        id: 'TICKET-004',
        customer: 'Pharmacy GHI',
        customerPhone: '+234 804 567 8901',
        customerEmail: 'pharmacy.ghi@email.com',
        subject: 'Product availability inquiry',
        description: 'I need to know if Paracetamol 500mg is available in bulk.',
        priority: 'low',
        status: 'closed',
        category: 'general',
        assignedAgent: 'David Kim',
        createdAt: '2024-01-13 16:20',
        updatedAt: '2024-01-14 09:15',
        responseTime: 30
      },
      {
        id: 'TICKET-005',
        customer: 'Pharmacy JKL',
        customerPhone: '+234 805 678 9012',
        customerEmail: 'pharmacy.jkl@email.com',
        subject: 'WhatsApp integration problem',
        description: 'WhatsApp messages are not being received properly.',
        priority: 'high',
        status: 'in_progress',
        category: 'technical',
        assignedAgent: 'Lisa Wang',
        createdAt: '2024-01-16 08:15',
        updatedAt: '2024-01-16 12:30',
        responseTime: 60
      },
      {
        id: 'TICKET-006',
        customer: 'Pharmacy MNO',
        customerPhone: '+234 806 789 0123',
        customerEmail: 'pharmacy.mno@email.com',
        subject: 'Account suspension inquiry',
        description: 'My account was suspended and I need to know why.',
        priority: 'urgent',
        status: 'open',
        category: 'general',
        assignedAgent: 'James Wilson',
        createdAt: '2024-01-16 13:45',
        updatedAt: '2024-01-16 13:45',
        responseTime: 0
      },
      {
        id: 'TICKET-007',
        customer: 'Pharmacy PQR',
        customerPhone: '+234 807 890 1234',
        customerEmail: 'pharmacy.pqr@email.com',
        subject: 'Bulk order discount request',
        description: 'I want to place a large order and need information about bulk discounts.',
        priority: 'medium',
        status: 'resolved',
        category: 'order',
        assignedAgent: 'Maria Garcia',
        createdAt: '2024-01-15 10:20',
        updatedAt: '2024-01-15 15:45',
        responseTime: 90
      },
      {
        id: 'TICKET-008',
        customer: 'Pharmacy STU',
        customerPhone: '+234 808 901 2345',
        customerEmail: 'pharmacy.stu@email.com',
        subject: 'Refund processing delay',
        description: 'My refund request was approved but the money hasn\'t been returned.',
        priority: 'high',
        status: 'in_progress',
        category: 'billing',
        assignedAgent: 'Robert Brown',
        createdAt: '2024-01-14 16:30',
        updatedAt: '2024-01-16 09:20',
        responseTime: 75
      }
    ];

    // Apply filters
    let filteredTickets = mockTickets;
    
    if (status && status !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    
    if (priority && priority !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }

    if (category && category !== 'all') {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === category);
    }

    // Apply pagination
    const paginatedTickets = filteredTickets.slice(offset, offset + parseInt(limit as string));

    // Calculate statistics
    const totalTickets = mockTickets.length;
    const openTickets = mockTickets.filter(t => t.status === 'open').length;
    const inProgressTickets = mockTickets.filter(t => t.status === 'in_progress').length;
    const resolvedTickets = mockTickets.filter(t => t.status === 'resolved').length;
    const closedTickets = mockTickets.filter(t => t.status === 'closed').length;
    const urgentTickets = mockTickets.filter(t => t.priority === 'urgent').length;
    const averageResponseTime = mockTickets.reduce((sum, t) => sum + t.responseTime, 0) / mockTickets.length;

    const result = {
      data: paginatedTickets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredTickets.length,
        totalPages: Math.ceil(filteredTickets.length / parseInt(limit as string))
      },
      statistics: {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        closedTickets,
        urgentTickets,
        averageResponseTime: Math.round(averageResponseTime)
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Support tickets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets data' });
  }
});

// Get help articles data
router.get('/help', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
    const databaseService = req.app.locals.services?.database;
    if (!databaseService) {
      return res.status(500).json({ error: 'Database service not available' });
    }

    const supabase = databaseService.supabase;
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase client not available' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // For now, we'll create mock help article data since we don't have a help_articles table
    // In a real implementation, you would have a help_articles table
    const mockHelpArticles = [
      {
        id: 'HA-001',
        title: 'How to Create Your First Order',
        category: 'Orders',
        content: 'Learn how to create and manage your first wholesale order...',
        tags: ['orders', 'beginner', 'tutorial'],
        views: 1250,
        helpful: 98,
        lastUpdated: '2024-01-10'
      },
      {
        id: 'HA-002',
        title: 'Understanding Payment Methods',
        category: 'Payments',
        content: 'Complete guide to payment options and processing...',
        tags: ['payments', 'billing', 'finance'],
        views: 890,
        helpful: 76,
        lastUpdated: '2024-01-08'
      },
      {
        id: 'HA-003',
        title: 'Managing Your Inventory',
        category: 'Inventory',
        content: 'Best practices for inventory management and tracking...',
        tags: ['inventory', 'management', 'stock'],
        views: 2100,
        helpful: 145,
        lastUpdated: '2024-01-12'
      },
      {
        id: 'HA-004',
        title: 'Customer Support Guidelines',
        category: 'Support',
        content: 'How to get the best support experience...',
        tags: ['support', 'help', 'contact'],
        views: 650,
        helpful: 52,
        lastUpdated: '2024-01-05'
      },
      {
        id: 'HA-005',
        title: 'Account Setup and Verification',
        category: 'Account',
        content: 'Step-by-step guide to setting up your pharmacy account...',
        tags: ['account', 'setup', 'verification'],
        views: 1800,
        helpful: 120,
        lastUpdated: '2024-01-14'
      },
      {
        id: 'HA-006',
        title: 'WhatsApp Integration Setup',
        category: 'Technical',
        content: 'How to integrate WhatsApp Business API with your system...',
        tags: ['whatsapp', 'integration', 'api'],
        views: 950,
        helpful: 85,
        lastUpdated: '2024-01-11'
      },
      {
        id: 'HA-007',
        title: 'Order Tracking and Status Updates',
        category: 'Orders',
        content: 'Learn how to track your orders and understand status updates...',
        tags: ['orders', 'tracking', 'status'],
        views: 1400,
        helpful: 110,
        lastUpdated: '2024-01-09'
      },
      {
        id: 'HA-008',
        title: 'Payment Gateway Configuration',
        category: 'Payments',
        content: 'Configure payment gateways for seamless transactions...',
        tags: ['payments', 'gateway', 'configuration'],
        views: 750,
        helpful: 65,
        lastUpdated: '2024-01-07'
      }
    ];

    // Apply filters
    let filteredArticles = mockHelpArticles;
    
    if (category && category !== 'all') {
      filteredArticles = filteredArticles.filter(article => article.category === category);
    }

    // Apply pagination
    const paginatedArticles = filteredArticles.slice(offset, offset + parseInt(limit as string));

    // Calculate statistics
    const totalArticles = mockHelpArticles.length;
    const totalViews = mockHelpArticles.reduce((sum, a) => sum + a.views, 0);
    const totalHelpful = mockHelpArticles.reduce((sum, a) => sum + a.helpful, 0);
    const categories = [...new Set(mockHelpArticles.map(a => a.category))];

    const result = {
      data: paginatedArticles,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: filteredArticles.length,
        totalPages: Math.ceil(filteredArticles.length / parseInt(limit as string))
      },
      statistics: {
        totalArticles,
        totalViews,
        totalHelpful,
        categories
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error('Help articles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch help articles data' });
  }
});

export { router as AdminRoutes };
