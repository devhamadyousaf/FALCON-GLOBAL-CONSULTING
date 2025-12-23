/**
 * Custom Pricing Library
 * Helper functions for managing custom pricing per lead
 */

import { supabase } from './supabase';

/**
 * Get custom pricing for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object|null>} Custom pricing data or null
 */
export async function getCustomPricing(userId) {
  try {
    const { data, error } = await supabase
      .from('custom_pricing')
      .select('*, created_by_profile:profiles!custom_pricing_created_by_fkey(full_name, email)')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching custom pricing:', error);
      return null;
    }

    return data; // Returns the pricing object with all plan prices or null
  } catch (error) {
    console.error('Error fetching custom pricing:', error);
    return null;
  }
}

/**
 * Create or update custom pricing for a user
 * @param {Object} params - Pricing parameters
 * @param {string} params.userId - The user ID
 * @param {number} params.silverPrice - Price for Silver plan
 * @param {number} params.goldPrice - Price for Gold plan
 * @param {number} params.diamondPrice - Price for Diamond plan
 * @param {number} params.diamondPlusPrice - Price for Diamond Plus plan
 * @param {string} params.currency - Currency (default: USD)
 * @param {string} params.notes - Optional notes
 * @param {string} params.token - Auth token
 * @returns {Promise<Object>} Result of the operation
 */
export async function saveCustomPricing({ userId, silverPrice, goldPrice, diamondPrice, diamondPlusPrice, currency = 'USD', notes, token }) {
  try {
    const response = await fetch('/api/admin/custom-pricing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        silverPrice,
        goldPrice,
        diamondPrice,
        diamondPlusPrice,
        currency,
        notes
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to save custom pricing');
    }

    return result;
  } catch (error) {
    console.error('Error saving custom pricing:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete custom pricing for a user
 * @param {string} userId - The user ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Result of the operation
 */
export async function deleteCustomPricing(userId, token) {
  try {
    const response = await fetch(`/api/admin/custom-pricing?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete custom pricing');
    }

    return result;
  } catch (error) {
    console.error('Error deleting custom pricing:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get the effective price for a user and plan
 * Falls back to default pricing if no custom pricing exists
 * @param {string} userId - The user ID
 * @param {string} planName - Name of the plan (silver, gold, diamond, diamond-plus)
 * @param {Object} defaultPrices - Default pricing object
 * @returns {Promise<Object>} Effective pricing information
 */
export async function getEffectivePrice(userId, planName) {
  try {
    const customPricing = await getCustomPricing(userId);

    if (customPricing) {
      // Map plan name to column name
      const priceColumn = `${planName.replace('-', '_')}_price`;
      const customPrice = customPricing[priceColumn];

      if (customPrice !== null && customPrice !== undefined) {
        return {
          isCustom: true,
          price: Number(customPrice),
          currency: customPricing.currency || 'USD',
          notes: customPricing.notes
        };
      }
    }

    // Fall back to default pricing
    const defaultPrice = DEFAULT_PRICING[planName];
    return {
      isCustom: false,
      price: defaultPrice || 0,
      currency: 'USD'
    };
  } catch (error) {
    console.error('Error getting effective price:', error);
    return {
      isCustom: false,
      price: DEFAULT_PRICING[planName] || 0,
      currency: 'USD',
      error: error.message
    };
  }
}

/**
 * Default plan pricing (can be customized per deployment)
 */
export const DEFAULT_PRICING = {
  silver: 299,
  gold: 699,
  diamond: 1600,
  'diamond-plus': 1
};

/**
 * Available plans configuration
 */
export const AVAILABLE_PLANS = [
  { name: 'silver', label: 'Silver Plan', defaultPrice: 299 },
  { name: 'gold', label: 'Gold Plan', defaultPrice: 699 },
  { name: 'diamond', label: 'Diamond Plan', defaultPrice: 1600 },
  { name: 'diamond-plus', label: 'Diamond Plus Plan', defaultPrice: 1 }
];

/**
 * Bulk update pricing for all users with a specific plan
 * @param {string} planName - The plan name to update (silver, gold, diamond, diamond-plus)
 * @param {number} newPrice - The new price
 * @param {string} token - Auth token
 * @returns {Promise<Object>} Result of the operation
 */
export async function bulkUpdatePricing({ planName, newPrice, token }) {
  try {
    const response = await fetch('/api/admin/custom-pricing/bulk-update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        planName,
        newPrice
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to bulk update pricing');
    }

    return result;
  } catch (error) {
    console.error('Error bulk updating pricing:', error);
    return { success: false, error: error.message };
  }
}
