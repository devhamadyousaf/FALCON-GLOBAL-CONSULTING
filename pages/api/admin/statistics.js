import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Fetch statistics
    const stats = {};

    // Job Leads Statistics
    const { data: jobLeadsData } = await supabase
      .from('Job-Leads')
      .select('status, platform, email');

    stats.jobLeads = {
      total: jobLeadsData?.length || 0,
      byStatus: {},
      byPlatform: {},
      byUser: {}
    };

    if (jobLeadsData) {
      // Group by status
      jobLeadsData.forEach(job => {
        const status = job.status || 'UNKNOWN';
        stats.jobLeads.byStatus[status] = (stats.jobLeads.byStatus[status] || 0) + 1;
      });

      // Group by platform
      jobLeadsData.forEach(job => {
        const platform = job.platform || 'UNKNOWN';
        stats.jobLeads.byPlatform[platform] = (stats.jobLeads.byPlatform[platform] || 0) + 1;
      });

      // Group by user email
      jobLeadsData.forEach(job => {
        const email = job.email || 'UNKNOWN';
        stats.jobLeads.byUser[email] = (stats.jobLeads.byUser[email] || 0) + 1;
      });
    }

    // Job Applications Statistics
    const { data: applicationsData } = await supabase
      .from('job_applications')
      .select('status, user_id');

    stats.applications = {
      total: applicationsData?.length || 0,
      byStatus: {}
    };

    if (applicationsData) {
      applicationsData.forEach(app => {
        const status = app.status || 'UNKNOWN';
        stats.applications.byStatus[status] = (stats.applications.byStatus[status] || 0) + 1;
      });
    }

    // Users Statistics
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, role, onboarding_complete');

    stats.users = {
      total: usersData?.length || 0,
      admins: usersData?.filter(u => u.role === 'admin').length || 0,
      customers: usersData?.filter(u => u.role === 'customer').length || 0,
      onboardingComplete: usersData?.filter(u => u.onboarding_complete).length || 0,
      onboardingPending: usersData?.filter(u => !u.onboarding_complete).length || 0
    };

    // Documents Statistics
    const { data: documentsData } = await supabase
      .from('documents')
      .select('verified, document_type');

    stats.documents = {
      total: documentsData?.length || 0,
      verified: documentsData?.filter(d => d.verified).length || 0,
      pending: documentsData?.filter(d => !d.verified).length || 0,
      byType: {}
    };

    if (documentsData) {
      documentsData.forEach(doc => {
        const type = doc.document_type || 'UNKNOWN';
        stats.documents.byType[type] = (stats.documents.byType[type] || 0) + 1;
      });
    }

    // Payments Statistics
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('status, amount, plan, service_type');

    stats.payments = {
      total: paymentsData?.length || 0,
      totalRevenue: paymentsData?.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0,
      byStatus: {},
      byPlan: {},
      byServiceType: {}
    };

    if (paymentsData) {
      paymentsData.forEach(payment => {
        const status = payment.status || 'UNKNOWN';
        stats.payments.byStatus[status] = (stats.payments.byStatus[status] || 0) + 1;

        if (payment.plan) {
          stats.payments.byPlan[payment.plan] = (stats.payments.byPlan[payment.plan] || 0) + 1;
        }

        if (payment.service_type) {
          stats.payments.byServiceType[payment.service_type] = (stats.payments.byServiceType[payment.service_type] || 0) + 1;
        }
      });
    }

    return res.status(200).json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
