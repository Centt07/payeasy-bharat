import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();
    const payload = JSON.parse(body);

    console.log('Webhook received:', payload.event);

    // Extract payment info from webhook
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;

    if (!paymentEntity) {
      console.error('Invalid webhook payload');
      return new Response(
        JSON.stringify({ error: 'Invalid payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payment status based on event
    let status = 'pending';
    if (event === 'payment.captured' || event === 'order.paid') {
      status = 'completed';
    } else if (event === 'payment.failed') {
      status = 'failed';
    }

    // Find and update the payment
    const paymentId = paymentEntity.id;
    const { error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('payment_id', paymentId);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Payment ${paymentId} updated to ${status}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-razorpay-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
