'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { createRecipient, deleteRecipient, listRecipients, updateRecipient, type Recipient } from '@/services/recipientService'
import { uploadToStorage } from '@/utils/upload'

export default function RecipientsPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Recipient | null>(null)
  const [editName, setEditName] = useState('')
  const [editFirst, setEditFirst] = useState('')
  const [editLast, setEditLast] = useState('')
  const [editRelationship, setEditRelationship] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    listRecipients()
      .then((data) => active && setRecipients(data))
      .catch((e: any) => setError(e?.message ?? 'Failed to load recipients'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const resetForm = () => {
    setName('')
    setEmail('')
    setFirstName('')
    setLastName('')
    setRelationship('')
    setPhone('')
    setNotes('')
  }

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const rec = await createRecipient({
        name,
        email,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        relationship: relationship || undefined,
        phone: phone || undefined,
        notes: notes || undefined,
      })
      setRecipients((prev) => [rec, ...prev])
      resetForm()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to add recipient')
    } finally {
      setCreating(false)
    }
  }

  const onDelete = async (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this recipient?')) return
    try {
      await deleteRecipient(id)
      setRecipients((prev) => prev.filter((r) => r.id !== id))
    } catch (e: any) {
      if (typeof window !== 'undefined') {
        window.alert(e?.message ?? 'Delete failed')
      }
    }
  }

  return (
    <div className="app-container max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Recipients</h1>
      <form onSubmit={onCreate} className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Display Name (e.g., Mom)" required value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" className="input" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <input className="input" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <input className="input" placeholder="Relationship (e.g., Friend)" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Adding...' : 'Add Recipient'}
        </button>
      </form>

      <div className="grid gap-3">
        {loading && <div className="text-gray-500">Loading...</div>}
        {!loading && recipients.length === 0 && <div className="text-gray-600">No recipients yet. Add one above.</div>}
        {recipients.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 border">
                {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" /> : null}
              </div>
              <div className="space-y-0.5">
                <p className="font-medium">
                  {r.name} <span className="text-gray-500 text-sm">{r.relationship ? `· ${r.relationship}` : ''}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {r.first_name || r.last_name ? `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim() : null}
                </p>
                <p className="text-sm text-gray-600">
                  {r.email}
                  {r.phone ? ` · ${r.phone}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="btn btn-secondary cursor-pointer">
                Change photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadToStorage({
                        bucket: 'avatars',
                        directory: 'recipients',
                        file,
                        contentType: file.type,
                      })
                      const updated = await updateRecipient(r.id, { avatar_url: url })
                      setRecipients((prev) => prev.map((x) => (x.id === r.id ? updated : x)))
                    } catch (err) {
                      if (typeof window !== 'undefined') window.alert('Failed to upload image')
                    }
                  }}
                />
              </label>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(r)
                  setEditName(r.name)
                  setEditFirst(r.first_name ?? '')
                  setEditLast(r.last_name ?? '')
                  setEditRelationship(r.relationship ?? '')
                  setEditPhone(r.phone ?? '')
                  setEditNotes(r.notes ?? '')
                }}
              >
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => onDelete(r.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!editing}
        title="Edit Recipient"
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                if (!editing) return
                try {
                  const updated = await updateRecipient(editing.id, {
                    name: editName,
                    first_name: editFirst || null,
                    last_name: editLast || null,
                    relationship: editRelationship || null,
                    phone: editPhone || null,
                    notes: editNotes || null,
                  } as any)
                  setRecipients((prev) => prev.map((x) => (x.id === editing.id ? updated : x)))
                  setEditing(null)
                } catch (e: any) {
                  if (typeof window !== 'undefined') window.alert(e?.message ?? 'Update failed')
                }
              }}
            >
              Save
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <input className="input" placeholder="Display name" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="First name" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
            <input className="input" placeholder="Last name" value={editLast} onChange={(e) => setEditLast(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="input" placeholder="Relationship" value={editRelationship} onChange={(e) => setEditRelationship(e.target.value)} />
            <input className="input" placeholder="Phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <input className="input" placeholder="Notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}

