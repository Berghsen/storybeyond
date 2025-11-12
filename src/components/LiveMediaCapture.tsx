'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  onCaptured: (blob: Blob, kind: 'photo' | 'video') => void
}

// Camera component to capture photos or record videos via MediaDevices API
export default function LiveMediaCapture({ onCaptured }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [isReady, setIsReady] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [recording, setRecording] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewKind, setPreviewKind] = useState<'photo' | 'video' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [liveReady, setLiveReady] = useState(false)
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown')

  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop()
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      return
    }
    let cancelled = false
    navigator.permissions
      .query({ name: 'camera' as PermissionName })
      .then((status) => {
        if (cancelled) return
        setPermissionState(status.state as 'prompt' | 'granted' | 'denied')
        status.onchange = () => {
          setPermissionState(status.state as 'prompt' | 'granted' | 'denied')
        }
      })
      .catch(() => {
        if (!cancelled) setPermissionState('unknown')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Ensure isReady is true when we have an active stream
  useEffect(() => {
    if (isInitialized && mediaStreamRef.current && mediaStreamRef.current.active) {
      // Check periodically if stream is active and set ready
      const checkStream = () => {
        if (mediaStreamRef.current && mediaStreamRef.current.active && !isReady) {
          setIsReady(true)
          setLiveReady(true)
        }
      }
      checkStream()
      const interval = setInterval(checkStream, 500)
      return () => clearInterval(interval)
    }
  }, [isInitialized, isReady])

  const enableCamera = async () => {
    setError(null)
    setIsInitialized(false)
    setLiveReady(false)
    setIsReady(false)
    try {
      setPreviewUrl(null)
      setPreviewKind(null)
      setRecordedBlob(null)
      // Stop any existing stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop())
        mediaStreamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      
      // Try with audio, fall back to video-only if audio blocked
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
      }
      
      mediaStreamRef.current = stream
      setIsInitialized(true)
      
      // If stream is active, mark as ready immediately
      if (stream.active) {
        setIsReady(true)
        setLiveReady(true)
      }
      
      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        video.muted = true
        ;(video as any).playsInline = true
        
        // Function to mark as ready
        const markReady = () => {
          setLiveReady(true)
          setIsReady(true)
        }
        
        // Try to play
        try {
          await video.play()
        } catch (playErr) {
          // Play might fail, but video can still be ready
        }
        
        // Check if already ready (has metadata and dimensions)
        if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          markReady()
        } else {
          // Set up event listeners to detect when ready
          const onReady = () => {
            // Check if video has dimensions (means it's actually ready)
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              markReady()
              // Clean up listeners
              video.removeEventListener('loadedmetadata', onReady)
              video.removeEventListener('canplay', onReady)
              video.removeEventListener('playing', onReady)
              video.removeEventListener('loadeddata', onReady)
              video.removeEventListener('canplaythrough', onReady)
            }
          }
          
          video.addEventListener('loadedmetadata', onReady, { once: false })
          video.addEventListener('canplay', onReady, { once: false })
          video.addEventListener('playing', onReady, { once: false })
          video.addEventListener('loadeddata', onReady, { once: false })
          video.addEventListener('canplaythrough', onReady, { once: false })
          
          // Fallback timeout - mark as ready if video has dimensions
          setTimeout(() => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              markReady()
            } else {
              // Even if no dimensions, mark as ready after timeout to allow recording
              markReady()
            }
          }, 1500)
        }
      } else {
        // If video ref is not available, still mark as ready since we have the stream
        setIsReady(true)
        setLiveReady(true)
      }
    } catch (e: any) {
      // Common cause: not secure context or blocked permission
      const msg =
        e?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow access in your browser settings and try again.'
          : e?.message ?? 'Unable to access camera. Use localhost/HTTPS and try again.'
      setError(msg)
      setIsInitialized(false)
      setLiveReady(false)
      setIsReady(false)
    }
  }

  const takePhoto = async () => {
    setError(null)
    try {
      const video = videoRef.current
      if (!video || !isReady) {
        setError('Camera is not enabled')
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9),
      )
      if (!blob) throw new Error('Failed to capture photo')
      const localUrl = URL.createObjectURL(blob)
      setPreviewUrl(localUrl)
      setPreviewKind('photo')
      onCaptured(blob, 'photo')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to take photo')
    }
  }

  const startRecording = () => {
    setError(null)
    // Check if we have a stream - that's what matters for recording
    if (!mediaStreamRef.current) {
      setError('Camera is not enabled')
      return
    }
    // If not ready but we have a stream, mark as ready
    if (!isReady && mediaStreamRef.current.active) {
      setIsReady(true)
      setLiveReady(true)
    }
    chunksRef.current = []
    // Pick a supported mimeType with audio (opus)
    const preferredTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ]
    const chosenType =
      preferredTypes.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) ??
      undefined
    const recorder = new MediaRecorder(mediaStreamRef.current, chosenType ? { mimeType: chosenType } : undefined)
    mediaRecorderRef.current = recorder
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      setPreviewKind('video')
      onCaptured(blob, 'video')
      setRecording(false)
      // Keep isReady true so user can record again
      // Pause live video when showing recorded video, but keep stream active
      if (videoRef.current) {
        videoRef.current.pause()
        // Don't clear srcObject - keep stream for re-recording
      }
    }
    recorder.start()
    setRecording(true)
    // Keep showing live preview while recording
    setPreviewUrl(null)
    setPreviewKind(null)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  return (
    <div className="card p-4">
      <div className="mb-3">
        <p className="font-medium">Record Photo/Video</p>
        <p className="text-sm text-gray-600">Capture media using your device camera.</p>
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="space-y-3">
        {(isInitialized || previewUrl) && (
          <div className="w-full max-w-md mx-auto relative">
            <div className="aspect-[4/3] bg-black/10 rounded-lg overflow-hidden flex items-center justify-center relative">
              {(!previewUrl || recording) ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    muted
                    onCanPlay={() => {
                      setLiveReady(true)
                      setIsReady(true)
                    }}
                    onLoadedMetadata={() => {
                      setLiveReady(true)
                      setIsReady(true)
                    }}
                    onPlaying={() => {
                      setLiveReady(true)
                      setIsReady(true)
                    }}
                    onLoadedData={() => {
                      setLiveReady(true)
                      setIsReady(true)
                    }}
                  />
                  {!liveReady && isInitialized ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white/80 px-2 py-1 rounded bg-black/40">
                      Initializing camera…
                    </div>
                  ) : null}
                  {recording && liveReady && (
                    <div className="absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded bg-red-600 text-white text-xs">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Recording
                    </div>
                  )}
                </>
              ) : previewKind === 'photo' ? (
                <img src={previewUrl} alt="Captured" className="w-full h-full object-contain" />
              ) : previewKind === 'video' ? (
                <video 
                  src={previewUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  key={previewUrl}
                />
              ) : null}
            </div>
          </div>
        )}
        {!isInitialized ? (
          <button type="button" className="btn btn-primary" onClick={enableCamera}>
            Enable Camera
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={takePhoto}
              disabled={!isReady || recording || !mediaStreamRef.current}
            >
              Take Photo
            </button>
            {!recording ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={startRecording}
                  disabled={!isReady || !mediaStreamRef.current}
                >
                  Start Recording
                </button>
                {recordedBlob && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        // Replay recorded video from saved blob
                        if (previewUrl && previewUrl.startsWith('blob:')) {
                          URL.revokeObjectURL(previewUrl)
                        }
                        const url = URL.createObjectURL(recordedBlob)
                        setPreviewKind('video')
                        setPreviewUrl(url)
                        // Pause live video but keep stream for re-recording
                        if (videoRef.current) {
                          videoRef.current.pause()
                        }
                      }}
                    >
                      Replay
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={enableCamera}
                    >
                      Record Again
                    </button>
                  </>
                )}
                {!recordedBlob && previewUrl && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setPreviewUrl(null)
                      setPreviewKind(null)
                    }}
                  >
                    Retake
                  </button>
                )}
              </>
            ) : (
              <button type="button" className="btn btn-danger" onClick={stopRecording}>
                Stop Recording
              </button>
            )}
          </div>
        )}
        {permissionState === 'denied' && (
          <div className="text-sm text-red-600">
            Camera access is currently blocked. Please allow camera permissions in your browser or device settings, then tap&nbsp;
            <button type="button" className="underline" onClick={enableCamera}>
              Enable Camera
            </button>
            &nbsp;again.
          </div>
        )}
      </div>
    </div>
  )
}

