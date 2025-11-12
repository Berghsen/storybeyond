'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { getMyProfile, upsertMyProfile } from '@/services/profileService'
import { uploadToStorage } from '@/utils/upload'

export default function ProfilePage() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setEmail(user?.email ?? '')
    getMyProfile()
      .then((profile) => {
        if (!profile) return
        setFullName(profile.full_name ?? '')
        setPhone(profile.phone ?? '')
        setAvatarUrl(profile.avatar_url ?? null)
      })
      .catch(() => {})
  }, [user?.email])

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      setMessage('Profile updated. Check your inbox if email change requires confirmation.')
    } catch (e: any) {
      setMessage(e?.message ?? 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setMessage(null)
    try {
      await upsertMyProfile({
        full_name: fullName || null,
        phone: phone || null,
        avatar_url: avatarUrl || null,
      })
      setMessage('Profile updated.')
    } catch (e: any) {
      setMessage(e?.message ?? 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUpdating(true)
    setMessage(null)
    try {
      const url = await uploadToStorage({
        bucket: 'avatars',
        directory: 'users',
        file,
        contentType: file.type,
      })
      setAvatarUrl(url)
      await upsertMyProfile({ avatar_url: url })
      setMessage('Profile picture updated.')
    } catch (e: any) {
      setMessage(e?.message ?? 'Avatar upload failed')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Profile & Settings</h1>
      <form onSubmit={onSaveProfile} className="card p-6 space-y-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 border">
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : null}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            Change photo
          </button>
        </div>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
        <button className="btn btn-primary" disabled={updating}>
          {updating ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
      <form onSubmit={updateEmail} className="card p-6 space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
        <button className="btn btn-primary" disabled={updating}>
          {updating ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

