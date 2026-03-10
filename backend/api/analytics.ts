import { Router } from 'express';
import os from 'os';
import { query } from '../db';

const router = Router();

// Live DB stats endpoint
router.get('/db', async (req, res) => {
  try {
    // Real-time DB stats for all key tables
    const stats = {};
    const tables = [
      'admins', 'admin_records', 'assessment_answers', 'assessment_reports', 'audits', 'audit_reports', 'cart_items', 'chat_messages',
      'companies', 'company_assessments', 'company_briefings', 'company_requests', 'customer_accounts', 'enrollments', 'interns',
      'intern_programs', 'learning_services', 'messages', 'ohio_customers', 'ohio_integration_event_log', 'ohio_payments', 'ohio_sales',
      'ohio_services', 'orders', 'order_items', 'sales_records', 'services', 'service_requests', 'sessions', 'simulation_events',
      'simulation_runs', 'simulation_scenarios', 'site_metrics', 'support_chat_messages', 'support_tickets', 'tickets', 'time_logs',
      'users', 'user_onboarding', 'user_settings'
    ];
    for (const table of tables) {
      try {
        stats[table] = (await query(`SELECT COUNT(*) as count FROM ${table}`))[0]?.count || 0;
      } catch (err) {
        stats[table] = 'error';
      }
    }
    // Example: get recent events from ohio_integration_event_log
    let recentEvents = [];
    try {
      recentEvents = await query('SELECT * FROM ohio_integration_event_log ORDER BY timestamp DESC LIMIT 5');
    } catch {}
    // DB connection stats
    const pool = require('../db').pool;
    const activeConnections = pool.activeConnections || 0;
    const idleConnections = pool.idleConnections || 0;
    // Server health
    const serverStatus = {
      hostname: os.hostname(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().rss,
      cpuLoad: os.loadavg()[0],
      dbConnected: true,
    };
    res.json({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      connectionLimit: process.env.DB_CONNECTION_LIMIT,
      activeConnections,
      idleConnections,
      stats,
      recentEvents,
      serverStatus,
      lastUpdated: new Date().toISOString(),
    });
    // DB connection stats
    const pool = require('../db').pool;
    const activeConnections = pool.activeConnections || 0;
    const idleConnections = pool.idleConnections || 0;
    // Server health
    const serverStatus = {
      hostname: os.hostname(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().rss,
      cpuLoad: os.loadavg()[0],
      dbConnected: true,
    };
    res.json({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      connectionLimit: process.env.DB_CONNECTION_LIMIT,
      activeConnections,
      idleConnections,
      usersCount,
      customersCount,
      servicesCount,
      ticketsCount,
      reportsCount,
      syncEventsCount,
      recentSyncEvents,
      serverStatus,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'DB stats error.' });
  }
});

// Live server stats endpoint
router.get('/server', (req, res) => {
  try {
    res.json({
      host: os.hostname(),
      port: process.env.PORT || 4000,
      uptimeSeconds: process.uptime(),
      cpuLoad: os.loadavg()[0],
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      totalMemoryMB: Math.round(os.totalmem() / 1024 / 1024),
      freeMemoryMB: Math.round(os.freemem() / 1024 / 1024),
      diskUsage: 'N/A', // Disk usage requires extra package or shell command
      endpoints: [], // Can be populated from Express router if needed
      errorLogs: [], // Should be populated from real logs if available
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server stats error.' });
  }
});

export default router;
