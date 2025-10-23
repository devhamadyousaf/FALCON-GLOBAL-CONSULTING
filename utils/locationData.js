// Location data for country, state, and city dropdowns

export const countries = [
  { value: '', label: 'Select Country' },
  { value: 'US', label: 'United States', flag: '🇺🇸' },
  { value: 'CA', label: 'Canada', flag: '🇨🇦' },
  { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'DE', label: 'Germany', flag: '🇩🇪' },
  { value: 'FR', label: 'France', flag: '🇫🇷' },
  { value: 'NL', label: 'Netherlands', flag: '🇳🇱' },
  { value: 'CH', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'AU', label: 'Australia', flag: '🇦🇺' },
  { value: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
  { value: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { value: 'AE', label: 'United Arab Emirates', flag: '🇦🇪' },
  { value: 'SA', label: 'Saudi Arabia', flag: '🇸🇦' },
  { value: 'QA', label: 'Qatar', flag: '🇶🇦' },
  { value: 'KW', label: 'Kuwait', flag: '🇰🇼' },
  { value: 'BH', label: 'Bahrain', flag: '🇧🇭' },
  { value: 'OM', label: 'Oman', flag: '🇴🇲' },
  { value: 'IN', label: 'India', flag: '🇮🇳' },
  { value: 'PK', label: 'Pakistan', flag: '🇵🇰' },
  { value: 'BD', label: 'Bangladesh', flag: '🇧🇩' },
  { value: 'PH', label: 'Philippines', flag: '🇵🇭' },
  { value: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { value: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { value: 'VN', label: 'Vietnam', flag: '🇻🇳' },
  { value: 'ID', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'JP', label: 'Japan', flag: '🇯🇵' },
  { value: 'CN', label: 'China', flag: '🇨🇳' },
  { value: 'KR', label: 'South Korea', flag: '🇰🇷' },
  { value: 'BR', label: 'Brazil', flag: '🇧🇷' },
  { value: 'MX', label: 'Mexico', flag: '🇲🇽' },
  { value: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { value: 'ZA', label: 'South Africa', flag: '🇿🇦' },
  { value: 'NG', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'EG', label: 'Egypt', flag: '🇪🇬' },
  { value: 'KE', label: 'Kenya', flag: '🇰🇪' },
  { value: 'ES', label: 'Spain', flag: '🇪🇸' },
  { value: 'IT', label: 'Italy', flag: '🇮🇹' },
  { value: 'PT', label: 'Portugal', flag: '🇵🇹' },
  { value: 'SE', label: 'Sweden', flag: '🇸🇪' },
  { value: 'NO', label: 'Norway', flag: '🇳🇴' },
  { value: 'DK', label: 'Denmark', flag: '🇩🇰' },
  { value: 'FI', label: 'Finland', flag: '🇫🇮' },
  { value: 'PL', label: 'Poland', flag: '🇵🇱' },
  { value: 'IE', label: 'Ireland', flag: '🇮🇪' },
  { value: 'BE', label: 'Belgium', flag: '🇧🇪' },
  { value: 'AT', label: 'Austria', flag: '🇦🇹' }
];

// States/Provinces by country
export const statesByCountry = {
  US: [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' }
  ],
  CA: [
    { value: '', label: 'Select Province' },
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' }
  ],
  GB: [
    { value: '', label: 'Select Region' },
    { value: 'ENG', label: 'England' },
    { value: 'SCT', label: 'Scotland' },
    { value: 'WLS', label: 'Wales' },
    { value: 'NIR', label: 'Northern Ireland' }
  ],
  DE: [
    { value: '', label: 'Select State' },
    { value: 'BW', label: 'Baden-Württemberg' },
    { value: 'BY', label: 'Bavaria' },
    { value: 'BE', label: 'Berlin' },
    { value: 'BB', label: 'Brandenburg' },
    { value: 'HB', label: 'Bremen' },
    { value: 'HH', label: 'Hamburg' },
    { value: 'HE', label: 'Hesse' },
    { value: 'MV', label: 'Mecklenburg-Vorpommern' },
    { value: 'NI', label: 'Lower Saxony' },
    { value: 'NW', label: 'North Rhine-Westphalia' },
    { value: 'RP', label: 'Rhineland-Palatinate' },
    { value: 'SL', label: 'Saarland' },
    { value: 'SN', label: 'Saxony' },
    { value: 'ST', label: 'Saxony-Anhalt' },
    { value: 'SH', label: 'Schleswig-Holstein' },
    { value: 'TH', label: 'Thuringia' }
  ],
  AU: [
    { value: '', label: 'Select State' },
    { value: 'NSW', label: 'New South Wales' },
    { value: 'VIC', label: 'Victoria' },
    { value: 'QLD', label: 'Queensland' },
    { value: 'WA', label: 'Western Australia' },
    { value: 'SA', label: 'South Australia' },
    { value: 'TAS', label: 'Tasmania' },
    { value: 'NT', label: 'Northern Territory' },
    { value: 'ACT', label: 'Australian Capital Territory' }
  ],
  IN: [
    { value: '', label: 'Select State' },
    { value: 'AN', label: 'Andaman and Nicobar Islands' },
    { value: 'AP', label: 'Andhra Pradesh' },
    { value: 'AR', label: 'Arunachal Pradesh' },
    { value: 'AS', label: 'Assam' },
    { value: 'BR', label: 'Bihar' },
    { value: 'CH', label: 'Chandigarh' },
    { value: 'CG', label: 'Chhattisgarh' },
    { value: 'DH', label: 'Dadra and Nagar Haveli and Daman and Diu' },
    { value: 'DL', label: 'Delhi' },
    { value: 'GA', label: 'Goa' },
    { value: 'GJ', label: 'Gujarat' },
    { value: 'HR', label: 'Haryana' },
    { value: 'HP', label: 'Himachal Pradesh' },
    { value: 'JK', label: 'Jammu and Kashmir' },
    { value: 'JH', label: 'Jharkhand' },
    { value: 'KA', label: 'Karnataka' },
    { value: 'KL', label: 'Kerala' },
    { value: 'LA', label: 'Ladakh' },
    { value: 'LD', label: 'Lakshadweep' },
    { value: 'MP', label: 'Madhya Pradesh' },
    { value: 'MH', label: 'Maharashtra' },
    { value: 'MN', label: 'Manipur' },
    { value: 'ML', label: 'Meghalaya' },
    { value: 'MZ', label: 'Mizoram' },
    { value: 'NL', label: 'Nagaland' },
    { value: 'OR', label: 'Odisha' },
    { value: 'PY', label: 'Puducherry' },
    { value: 'PB', label: 'Punjab' },
    { value: 'RJ', label: 'Rajasthan' },
    { value: 'SK', label: 'Sikkim' },
    { value: 'TN', label: 'Tamil Nadu' },
    { value: 'TS', label: 'Telangana' },
    { value: 'TR', label: 'Tripura' },
    { value: 'UP', label: 'Uttar Pradesh' },
    { value: 'UK', label: 'Uttarakhand' },
    { value: 'WB', label: 'West Bengal' }
  ],
  AE: [
    { value: '', label: 'Select Emirate' },
    { value: 'AZ', label: 'Abu Dhabi' },
    { value: 'AJ', label: 'Ajman' },
    { value: 'DU', label: 'Dubai' },
    { value: 'FU', label: 'Fujairah' },
    { value: 'RK', label: 'Ras Al Khaimah' },
    { value: 'SH', label: 'Sharjah' },
    { value: 'UQ', label: 'Umm Al Quwain' }
  ],
  SA: [
    { value: '', label: 'Select Province' },
    { value: 'RD', label: 'Riyadh' },
    { value: 'MK', label: 'Makkah' },
    { value: 'MD', label: 'Madinah' },
    { value: 'EP', label: 'Eastern Province' },
    { value: 'AS', label: 'Asir' },
    { value: 'TB', label: 'Tabuk' },
    { value: 'HA', label: 'Hail' },
    { value: 'NB', label: 'Najran' },
    { value: 'JZ', label: 'Jazan' },
    { value: 'JF', label: 'Al Jawf' },
    { value: 'BA', label: 'Al Bahah' },
    { value: 'QL', label: 'Al Qassim' },
    { value: 'NR', label: 'Northern Borders' }
  ]
};

// Major cities by country (sample data - can be expanded)
export const citiesByCountry = {
  US: [
    { value: '', label: 'Select City' },
    { value: 'new-york', label: 'New York' },
    { value: 'los-angeles', label: 'Los Angeles' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'houston', label: 'Houston' },
    { value: 'phoenix', label: 'Phoenix' },
    { value: 'philadelphia', label: 'Philadelphia' },
    { value: 'san-antonio', label: 'San Antonio' },
    { value: 'san-diego', label: 'San Diego' },
    { value: 'dallas', label: 'Dallas' },
    { value: 'san-jose', label: 'San Jose' },
    { value: 'austin', label: 'Austin' },
    { value: 'seattle', label: 'Seattle' },
    { value: 'miami', label: 'Miami' },
    { value: 'boston', label: 'Boston' },
    { value: 'washington', label: 'Washington D.C.' }
  ],
  CA: [
    { value: '', label: 'Select City' },
    { value: 'toronto', label: 'Toronto' },
    { value: 'montreal', label: 'Montreal' },
    { value: 'vancouver', label: 'Vancouver' },
    { value: 'calgary', label: 'Calgary' },
    { value: 'edmonton', label: 'Edmonton' },
    { value: 'ottawa', label: 'Ottawa' },
    { value: 'winnipeg', label: 'Winnipeg' },
    { value: 'quebec-city', label: 'Quebec City' }
  ],
  GB: [
    { value: '', label: 'Select City' },
    { value: 'london', label: 'London' },
    { value: 'manchester', label: 'Manchester' },
    { value: 'birmingham', label: 'Birmingham' },
    { value: 'glasgow', label: 'Glasgow' },
    { value: 'liverpool', label: 'Liverpool' },
    { value: 'edinburgh', label: 'Edinburgh' },
    { value: 'bristol', label: 'Bristol' },
    { value: 'leeds', label: 'Leeds' }
  ],
  DE: [
    { value: '', label: 'Select City' },
    { value: 'berlin', label: 'Berlin' },
    { value: 'hamburg', label: 'Hamburg' },
    { value: 'munich', label: 'Munich' },
    { value: 'cologne', label: 'Cologne' },
    { value: 'frankfurt', label: 'Frankfurt' },
    { value: 'stuttgart', label: 'Stuttgart' },
    { value: 'dusseldorf', label: 'Düsseldorf' },
    { value: 'dortmund', label: 'Dortmund' }
  ],
  AE: [
    { value: '', label: 'Select City' },
    { value: 'dubai', label: 'Dubai' },
    { value: 'abu-dhabi', label: 'Abu Dhabi' },
    { value: 'sharjah', label: 'Sharjah' },
    { value: 'ajman', label: 'Ajman' },
    { value: 'ras-al-khaimah', label: 'Ras Al Khaimah' },
    { value: 'fujairah', label: 'Fujairah' },
    { value: 'umm-al-quwain', label: 'Umm Al Quwain' }
  ],
  SA: [
    { value: '', label: 'Select City' },
    { value: 'riyadh', label: 'Riyadh' },
    { value: 'jeddah', label: 'Jeddah' },
    { value: 'mecca', label: 'Mecca' },
    { value: 'medina', label: 'Medina' },
    { value: 'dammam', label: 'Dammam' },
    { value: 'khobar', label: 'Khobar' },
    { value: 'dhahran', label: 'Dhahran' },
    { value: 'taif', label: 'Taif' }
  ],
  IN: [
    { value: '', label: 'Select City' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'chennai', label: 'Chennai' },
    { value: 'kolkata', label: 'Kolkata' },
    { value: 'pune', label: 'Pune' },
    { value: 'ahmedabad', label: 'Ahmedabad' }
  ]
};

// Helper function to get states for a country
export const getStatesForCountry = (countryCode) => {
  return statesByCountry[countryCode] || [{ value: '', label: 'Select State/Province' }];
};

// Helper function to get cities for a country
export const getCitiesForCountry = (countryCode) => {
  return citiesByCountry[countryCode] || [{ value: '', label: 'Select City' }];
};

// European countries for relocation type filtering
export const europeanCountries = ['DE', 'FR', 'NL', 'CH', 'GB', 'ES', 'IT', 'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'IE', 'BE', 'AT'];

// GCC countries
export const gccCountries = ['AE', 'SA', 'QA', 'KW', 'BH', 'OM'];

// Check if country is in Europe
export const isEuropeanCountry = (countryCode) => {
  return europeanCountries.includes(countryCode);
};

// Check if country is in GCC
export const isGCCCountry = (countryCode) => {
  return gccCountries.includes(countryCode);
};
