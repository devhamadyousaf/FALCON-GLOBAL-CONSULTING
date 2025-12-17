// N8N Code Node for Naukri Data Mapping to Supabase
// This maps Naukri scraper output to your existing table structure

const item = $input.item.json;
const webhookEmail = $('Webhook').item.json.body.email;

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null;
  try {
    // Naukri createdDate format: "2025-11-17 06:10:04"
    const date = new Date(dateString);
    return date.toISOString();
  } catch (e) {
    return null;
  }
}

// Helper function to format contacts/external emails
function formatExternalEmails(contacts) {
  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return null;
  }
  return contacts
    .map(c => `${c?.full_name || 'N/A'}(${c?.title || 'N/A'})-(${c?.value || 'N/A'})`)
    .join(', ');
}

// Helper function to get company description
function getCompanyInformation(item) {
  if (item.details) {
    return JSON.stringify(item.details);
  }
  if (item.site_data?.description) {
    return item.site_data.description;
  }
  return null;
}

return {
  json: {
    // Company Information
    companyname: item.companyName || null,
    companywebsite: item.normalizedURL || item.companyURL || null,
    companylinkedinurl: item.socials?.linkedin || null,
    employeecount: null, // Not available in Naukri data
    companyinformation: getCompanyInformation(item),
    
    // Job Information
    jobtitle: item.title || null,
    joburl: item.jdURL || null,
    location: item.location || 'Remote',
    description: item.jobDescription || null,
    postedat: formatDate(item.createdDate),
    
    // Status and Platform
    status: "NEW",
    platform: "naukri",
    
    // Email and Contact Data
    externalemails: formatExternalEmails(item.contacts),
    emaildataraw: item.emails || [],
    phonenumbersraw: item.phones || [],
    externalemaildataraw: item.contacts || [],
    emailenrichment: item.emails || [],
    
    // Webhook Email
    email: webhookEmail || null,
    
    // Additional metadata (optional - stored as JSON strings)
    applicationcount: null // Not available in Naukri data
  }
};
