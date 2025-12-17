// N8N Code Node for Bayt Data Mapping to Supabase
// This maps Bayt scraper output to your existing table structure

const item = $input.item.json;
const webhookEmail = $('Webhook').item.json.body.email;

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return null;
  try {
    // Bayt postedAt format: "2025-11-15"
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
    .map(c => `${c?.full_name || 'N/A'}(${c?.title || ''})-(${c?.value || 'N/A'})`)
    .join(', ');
}

// Helper function to extract employee count from details
function getEmployeeCount(details) {
  if (!details) return null;
  
  // Try various formats
  if (details.employees) {
    // Sometimes it's a string like "[201, 500]" or "201-500"
    if (typeof details.employees === 'string') {
      return details.employees;
    }
    return JSON.stringify(details.employees);
  }
  
  if (details.size && typeof details.size === 'object') {
    // Format: {f: 250, t: 250} or {f: 51, t: 200}
    return `${details.size.f}-${details.size.t}`;
  }
  
  return null;
}

// Helper function to get company information
function getCompanyInformation(item) {
  let info = {};
  
  // Add details if available
  if (item.details) {
    info.details = item.details;
  }
  
  // Add site description if available
  if (item.site_data?.description) {
    info.description = item.site_data.description;
  }
  
  // Add industry info if available
  if (item.details?.industry) {
    info.industry = item.details.industry;
  }
  
  return Object.keys(info).length > 0 ? JSON.stringify(info) : null;
}

return {
  json: {
    // Company Information
    companyname: item.company || null,
    companywebsite: item.normalizedURL || item.companyURL || null,
    companylinkedinurl: item.socials?.linkedin || null,
    employeecount: getEmployeeCount(item.details),
    companyinformation: getCompanyInformation(item),
    
    // Job Information
    jobtitle: item.title || null,
    joburl: item.url || null,
    location: item.location || 'Remote',
    description: item.descriptionText || null,
    postedat: formatDate(item.postedAt),
    
    // Status and Platform
    status: "NEW",
    platform: "bayt",
    
    // Email and Contact Data
    externalemails: formatExternalEmails(item.contacts),
    emaildataraw: item.emails || [],
    phonenumbersraw: item.phones || [],
    externalemaildataraw: item.contacts || [],
    emailenrichment: item.emails || [],
    
    // Webhook Email
    email: webhookEmail || null,
    
    // Additional metadata (optional - not in Bayt data)
    applicationcount: null
  }
};
