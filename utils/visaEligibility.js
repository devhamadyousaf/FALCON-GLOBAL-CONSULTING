// Visa eligibility calculator for EU Blue Card (Germany)

export function calculateVisaEligibility(visaCheckData) {
  const {
    stayLongerThan90Days,
    citizenship,
    englishLevel,
    jobOffer,
    education,
    specialRegulation,
    educationCountry,
    degreeRecognized,
    workExperience
  } = visaCheckData;

  // Track reasons for ineligibility
  const ineligibilityReasons = [];
  let isEligible = true;

  // Question 1: Stay longer than 90 days
  if (stayLongerThan90Days !== 'yes') {
    isEligible = false;
    ineligibilityReasons.push('You must plan to stay in Germany for longer than 90 days to qualify for an EU Blue Card.');
  }

  // Question 2: Citizenship
  if (citizenship === 'eu-country') {
    isEligible = false;
    ineligibilityReasons.push('EU citizens do not need an EU Blue Card visa as they have freedom of movement within the EU.');
  } else if (citizenship === 'visa-exempt') {
    // These countries might have special arrangements but still could apply for Blue Card
    // Not necessarily disqualifying
  }

  // Question 3: English level
  if (englishLevel === 'not-speak' || englishLevel === 'learning') {
    isEligible = false;
    ineligibilityReasons.push('You need at least basic professional English skills to work in Germany under the EU Blue Card scheme.');
  }

  // Question 4: Job offer
  if (jobOffer === 'nothing-mentioned' || jobOffer === 'search-in-germany') {
    isEligible = false;
    ineligibilityReasons.push('You must have a binding job offer or employment contract in Germany before applying for an EU Blue Card.');
  }

  // Question 5: Education
  if (education === 'none') {
    isEligible = false;
    ineligibilityReasons.push('You must have at least a recognized university degree or equivalent qualification for an EU Blue Card.');
  }

  // Special cases for IT experience
  if (education === 'it-experience-2years' || education === 'it-experience-3years') {
    // IT professionals with proven experience may qualify even without formal degree
    // This is acceptable
  }

  // Question 6: Special regulation - usually not disqualifying
  // Internal transfers and placement agreements can actually help

  // Question 7 & 8: Education country and recognition
  if (educationCountry === 'outside-germany' && degreeRecognized === 'no') {
    isEligible = false;
    ineligibilityReasons.push('Your degree must be recognized in Germany. You may need to get it assessed by the ZAB (Central Office for Foreign Education).');
  }

  // Question 9: Work experience
  // 3+ years of experience is generally beneficial but not always required
  // 0-2 years is acceptable for many positions

  return {
    eligible: isEligible,
    reasons: ineligibilityReasons,
    recommendation: isEligible
      ? 'You appear to meet the basic requirements for an EU Blue Card. Our team will review your complete application and guide you through the next steps.'
      : 'Based on your responses, you may not currently qualify for an EU Blue Card. Please schedule a consultation with our team to explore alternative visa options or ways to improve your eligibility.'
  };
}

// Get eligibility score (0-100)
export function getEligibilityScore(visaCheckData) {
  let score = 0;
  const maxScore = 100;
  const pointsPerQuestion = maxScore / 9;

  const {
    stayLongerThan90Days,
    citizenship,
    englishLevel,
    jobOffer,
    education,
    specialRegulation,
    educationCountry,
    degreeRecognized,
    workExperience
  } = visaCheckData;

  // Q1: Stay duration
  if (stayLongerThan90Days === 'yes') score += pointsPerQuestion;

  // Q2: Citizenship
  if (citizenship === 'non-eu') score += pointsPerQuestion;

  // Q3: English level
  if (englishLevel === 'fluent') score += pointsPerQuestion;
  else if (englishLevel === 'basic') score += pointsPerQuestion * 0.7;

  // Q4: Job offer
  if (jobOffer === 'have-job') score += pointsPerQuestion;
  else if (jobOffer === 'getting-job') score += pointsPerQuestion * 0.8;

  // Q5: Education
  if (education === 'university-degree') score += pointsPerQuestion;
  else if (education === 'vocational-training' || education === 'tertiary-education') score += pointsPerQuestion * 0.9;
  else if (education === 'it-experience-2years' || education === 'it-experience-3years') score += pointsPerQuestion * 0.8;

  // Q6: Special regulation
  if (specialRegulation === 'internal-transfer' || specialRegulation === 'placement-agreement') {
    score += pointsPerQuestion;
  } else {
    score += pointsPerQuestion * 0.7; // Not having special regulation isn't necessarily bad
  }

  // Q7: Education country
  if (educationCountry === 'germany') score += pointsPerQuestion;
  else if (educationCountry === 'outside-germany') score += pointsPerQuestion * 0.5;

  // Q8: Degree recognition
  if (degreeRecognized === 'yes') score += pointsPerQuestion;

  // Q9: Work experience
  if (workExperience === '3plus') score += pointsPerQuestion;
  else if (workExperience === '0-2') score += pointsPerQuestion * 0.6;

  return Math.round(score);
}
