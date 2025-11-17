// Test API endpoint to verify database writes work
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Get user from request
  const { userId, testData } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  try {
    console.log('🧪 TEST: Attempting to save onboarding data...');
    console.log('User ID:', userId);
    console.log('Data to save:', JSON.stringify(testData, null, 2));

    const dataToSave = {
      user_id: userId,
      relocation_type: 'gcc',
      personal_details: {
        fullName: 'Test User',
        email: 'test@example.com',
        telephone: '+1234567890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zip: '12345',
          country: 'Test Country'
        }
      },
      payment_completed: true,
      payment_details: { plan: 'gold', amount: 699 },
      call_scheduled: true,
      call_details: { date: '2025-01-15', time: '10:00' },
      documents_uploaded: true,
      documents: { passport: 'test.pdf' },
      current_step: 5,
      completed_steps: [0, 1, 3, 4, 5],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('onboarding_data')
      .upsert(dataToSave, { onConflict: 'user_id' })
      .select();

    if (error) {
      console.error('❌ Save failed:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error
      });
    }

    console.log('✅ Save successful:', data);

    // Verify by reading back
    const { data: verifyData, error: verifyError } = await supabase
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('🔍 Verification - Data in DB:', verifyData);
    }

    return res.status(200).json({
      success: true,
      savedData: data,
      verifiedData: verifyData
    });

  } catch (error) {
    console.error('❌ Exception:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
