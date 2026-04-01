import { supabase, supabaseAdmin } from '../../config/supabase'
import bcrypt from 'bcryptjs'

export async function createPin(userId: string, pin: string) {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits')

  const { data: existing } = await supabaseAdmin
    .from('user_pins')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing) throw new Error('PIN already exists. Use change PIN instead.')

  const hashed = await bcrypt.hash(pin, 10)

  const { error } = await supabaseAdmin.from('user_pins').insert({
    user_id: userId,
    pin_hash: hashed,
  })

  if (error) throw error
  return { message: 'PIN created successfully' }
}

export async function changePin(userId: string, oldPin: string, newPin: string) {
  if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) throw new Error('New PIN must be exactly 4 digits')

  const { data: existing } = await supabaseAdmin
    .from('user_pins')
    .select('pin_hash')
    .eq('user_id', userId)
    .single()

  if (!existing) throw new Error('No PIN found. Create a PIN first.')

  const isValid = await bcrypt.compare(oldPin, existing.pin_hash)
  if (!isValid) throw new Error('Current PIN is incorrect')

  if (oldPin === newPin) throw new Error('New PIN must be different from current PIN')

  const hashed = await bcrypt.hash(newPin, 10)

  const { error } = await supabaseAdmin
    .from('user_pins')
    .update({ pin_hash: hashed, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw error
  return { message: 'PIN updated successfully' }
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_pins')
    .select('pin_hash')
    .eq('user_id', userId)
    .single()

  if (!data) throw new Error('No PIN set. Please create a withdrawal PIN first.')

  const isValid = await bcrypt.compare(pin, data.pin_hash)
  if (!isValid) throw new Error('Incorrect PIN')

  return true
}

export async function hasPinSet(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_pins')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !!data
}

export async function changePassword(userId: string, email: string, currentPassword: string, newPassword: string) {
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })

  if (signInError) throw new Error('Current password is incorrect')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error

  return { message: 'Password updated successfully' }
}

export async function updateNotificationPreferences(userId: string, prefs: {
  match_alerts?: boolean
  marketing_emails?: boolean
  show_activity?: boolean
}) {
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      notification_match_alerts: prefs.match_alerts,
      notification_marketing: prefs.marketing_emails,
      show_activity: prefs.show_activity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) throw error
  return { message: 'Preferences updated' }
}
