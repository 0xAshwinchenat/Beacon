import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-server';

// GET /api/jobs - Fetch all jobs for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req);
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch jobs ordered by creation date (newest first)
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/jobs - Create a new job
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient(req);
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { job_title, company_name, location, platform, url, status, notes, job_description, date_applied } = body;

    // Validate required fields
    if (!job_title || !company_name) {
      return NextResponse.json({ error: 'Job title and Company name are required' }, { status: 400 });
    }

    // Insert job with user_id attached
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        job_title,
        company_name,
        location,
        platform: platform || 'Other',
        url,
        status: status || 'Applied',
        notes: notes || '',
        job_description: job_description || '',
        date_applied: date_applied || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
