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

    const { type = 'all' } = req.query;

    const exportData = {};

    if (type === 'all' || type === 'users') {
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      exportData.users = users || [];
    }

    if (type === 'all' || type === 'job_leads') {
      const { data: jobLeads } = await supabase
        .from('Job-Leads')
        .select('*')
        .order('created_at', { ascending: false });
      exportData.jobLeads = jobLeads || [];
    }

    if (type === 'all' || type === 'applications') {
      const { data: applications } = await supabase
        .from('job_applications')
        .select(`
          *,
          profiles!inner(full_name, email),
          Job-Leads!inner(jobtitle, companyname, location, platform)
        `)
        .order('applied_at', { ascending: false });
      exportData.applications = applications || [];
    }

    if (type === 'all' || type === 'documents') {
      const { data: documents } = await supabase
        .from('documents')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('uploaded_at', { ascending: false });
      exportData.documents = documents || [];
    }

    if (type === 'all' || type === 'payments') {
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });
      exportData.payments = payments || [];
    }

    if (type === 'all' || type === 'onboarding') {
      const { data: onboarding } = await supabase
        .from('onboarding_data')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });
      exportData.onboarding = onboarding || [];
    }

    // Convert to CSV if requested
    if (req.query.format === 'csv') {
      const csv = convertToCSV(exportData, type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${Date.now()}.csv`);
      return res.status(200).send(csv);
    }

    // Return as JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${Date.now()}.json`);
    return res.status(200).json({
      success: true,
      exportedAt: new Date().toISOString(),
      type,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

function convertToCSV(data, type) {
  let csv = '';

  Object.keys(data).forEach(key => {
    const records = data[key];
    if (!records || records.length === 0) return;

    csv += `\n\n=== ${key.toUpperCase()} ===\n\n`;

    // Get headers from first record
    const headers = Object.keys(records[0]);
    csv += headers.join(',') + '\n';

    // Add rows
    records.forEach(record => {
      const values = headers.map(header => {
        let value = record[header];

        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }

        // Escape commas and quotes
        if (value && typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            value = `"${value}"`;
          }
        }

        return value !== null && value !== undefined ? value : '';
      });

      csv += values.join(',') + '\n';
    });
  });

  return csv;
}
