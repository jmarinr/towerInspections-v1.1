/**
 * Site Visit Service
 * Handles Supabase CRUD for the site_visits table.
 * Keeps all DB logic isolated from UI components.
 */
import { supabase } from './supabaseClient'
import { getDeviceId } from './deviceId'

const ORG_CODE = 'PTI'

/**
 * Create a new site visit (order)
 */
export async function createSiteVisit({ orderNumber, siteId, siteName, session, lat, lng }) {
  const deviceId = getDeviceId()

  const row = {
    org_code: ORG_CODE,
    order_number: orderNumber,
    site_id: siteId,
    site_name: siteName,
    device_id: deviceId,
    inspector_username: session.username,
    inspector_name: session.name || null,
    inspector_role: session.role || null,
    start_lat: lat || null,
    start_lng: lng || null,
    status: 'open',
    started_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('site_visits')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Fetch open visits for the current inspector
 */
export async function fetchOpenVisits(inspectorUsername) {
  const { data, error } = await supabase
    .from('site_visits')
    .select('*')
    .eq('inspector_username', inspectorUsername)
    .eq('status', 'open')
    .order('started_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Search open visits by order number for a specific inspector
 */
export async function searchVisitByOrder(orderNumber, inspectorUsername) {
  const { data, error } = await supabase
    .from('site_visits')
    .select('*')
    .eq('order_number', orderNumber)
    .eq('inspector_username', inspectorUsername)
    .eq('status', 'open')
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data || null
}

/**
 * Close a site visit
 */
export async function closeSiteVisit(visitId, { lat, lng } = {}) {
  const { data, error } = await supabase
    .from('site_visits')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      end_lat: lat || null,
      end_lng: lng || null,
    })
    .eq('id', visitId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get submission counts for a visit (to show which forms are done)
 */
export async function fetchVisitSubmissions(visitId) {
  const { data, error } = await supabase
    .from('submissions')
    .select('form_code, payload, updated_at')
    .eq('site_visit_id', visitId)

  if (error) throw error
  return data || []
}

/**
 * Fetch a specific form submission for a visit.
 * Returns the payload data or null if not found.
 */
export async function fetchSubmissionForForm(visitId, formCode) {
  const { data, error } = await supabase
    .from('submissions')
    .select('form_code, payload, updated_at')
    .eq('site_visit_id', visitId)
    .eq('form_code', formCode)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data || null
}
