'use client'

import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const onChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)
    try {
      const { data: sessionData } = await supabase.auth.getUser()
      const email = sessionData.user?.email
      if (!email) throw new Error('No email for current user')
      const { error: reauthErr } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
      if (reauthErr) throw new Error('Current password is incorrect')
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setMsg('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (e: any) {
      setMsg(e?.message ?? 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <form onSubmit={onChangePassword} className="card p-6 space-y-4">
        <div>
          <label className="label">Current password</label>
          <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">New password</label>
          <input
            type="password"
            className="input"
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        {msg && <p className="text-sm text-gray-700">{msg}</p>}
        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </div>
  )
}

