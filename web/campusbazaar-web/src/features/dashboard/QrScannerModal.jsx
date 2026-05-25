import { useState, useEffect, useRef } from 'react'
import { X, Camera, CameraOff, KeyRound, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import jsQR from 'jsqr'
import api from '../../shared/api/axios'

export default function QrScannerModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('camera')
  const [manualInput, setManualInput] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [cameraError, setCameraError] = useState(null)
  const [capturedImage, setCapturedImage] = useState(null)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (mode === 'camera') startCamera()
    return () => stopCamera()
  }, [mode])

  const startCamera = async () => {
    setCameraError(null)
    setCapturedImage(null)
    setStatus('idle')
    setMessage('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
          setStatus('ready')
        }
      }
    } catch {
      setCameraError('Camera access denied or unavailable.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Save preview
    setCapturedImage(canvas.toDataURL('image/png'))
    stopCamera()
    setStatus('capturing')

    // Read QR
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    })

    console.log('QR result:', code)

    if (code?.data) {
      submitQrData(code.data)
    } else {
      setStatus('error')
      setMessage('No QR code detected. Make sure the QR fills the frame, then try again.')
    }
  }

  const handleRetry = () => {
    setCapturedImage(null)
    setMessage('')
    setStatus('idle')
    startCamera()
  }

  const submitQrData = async (qrData) => {
    setStatus('loading')
    setMessage('')
    try {
      const token = localStorage.getItem('token')
      const res = await api.post('/orders/scan-qr', { qrData }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStatus('success')
      setMessage(`Order ${res.data.data?.orderNumber} completed!`)
      setTimeout(() => { onSuccess?.(); onClose() }, 2000)
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.message || 'Failed to verify QR. Try again.')
    }
  }

  const handleManualSubmit = () => {
    const trimmed = manualInput.trim()
    if (!trimmed || status === 'loading') return
    const qrData = trimmed.includes('ORDER:')
      ? trimmed
      : `ORDER:${trimmed}|PRODUCT:manual|BUYER:manual|AMOUNT:0|METHOD:MEETUP`
    submitQrData(qrData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: '#1D5D5D' }}>
          <div>
            <h2 className="text-white font-bold text-lg"
              style={{ fontFamily: 'Georgia, serif' }}>
              Scan Buyer's QR Code
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#B28E3A' }}>
              Confirm MEETUP transaction
            </p>
          </div>
          <button onClick={() => { stopCamera(); onClose() }}
            className="text-white hover:opacity-70 transition p-1">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex" style={{ borderBottom: '1px solid #f0ebe0' }}>
          {[
            { id: 'camera', icon: Camera, label: 'Camera Scan' },
            { id: 'manual', icon: KeyRound, label: 'Enter Order No.' },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id}
              onClick={() => { setMode(id); setMessage(''); setCapturedImage(null) }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition"
              style={{
                borderBottom: mode === id ? '2px solid #1D5D5D' : '2px solid transparent',
                color: mode === id ? '#1D5D5D' : '#9ca3af',
                marginBottom: '-1px'
              }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* CAMERA MODE */}
          {mode === 'camera' && (
            <div>
              {cameraError ? (
                <div className="text-center py-8">
                  <CameraOff size={40} className="mx-auto mb-3" style={{ color: '#A3464D' }} />
                  <p className="text-sm" style={{ color: '#A3464D' }}>{cameraError}</p>
                  <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                    Use "Enter Order No." tab instead.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-black"
                    style={{ aspectRatio: '4/3' }}>

                    <video ref={videoRef}
                      className="w-full h-full object-cover"
                      style={{ display: capturedImage ? 'none' : 'block' }}
                      muted playsInline />

                    {capturedImage && (
                      <img src={capturedImage} alt="Captured"
                        className="w-full h-full object-cover" />
                    )}

                    <canvas ref={canvasRef} className="hidden" />

                    {/* Corner brackets */}
                    {status === 'ready' && !capturedImage && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-48 h-48 relative">
                          {[
                            'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                            'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                            'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                          ].map((cls, i) => (
                            <div key={i} className={`absolute w-10 h-10 ${cls}`}
                              style={{ borderColor: '#B28E3A' }} />
                          ))}
                        </div>
                        <p className="absolute bottom-3 text-xs px-3 py-1 rounded-full font-medium"
                          style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#E8E4C9' }}>
                          Position QR in frame, then capture
                        </p>
                      </div>
                    )}

                    {/* Loading overlay */}
                    {status === 'loading' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ backgroundColor: 'rgba(29,93,93,0.88)' }}>
                        <Loader size={40} className="text-white animate-spin" />
                        <p className="text-white text-sm font-medium">Verifying order...</p>
                      </div>
                    )}

                    {/* Success overlay */}
                    {status === 'success' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                        style={{ backgroundColor: 'rgba(111,128,60,0.92)' }}>
                        <CheckCircle size={56} className="text-white" />
                        <p className="text-white text-base font-bold">Order Completed! ✓</p>
                      </div>
                    )}
                  </div>

                  {/* Capture button */}
                  {status === 'ready' && !capturedImage && (
                    <button onClick={handleCapture}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#1D5D5D', color: '#E8E4C9' }}>
                      <Camera size={16} />
                      Capture & Scan QR
                    </button>
                  )}

                  {/* Retry button */}
                  {status === 'error' && capturedImage && (
                    <button onClick={handleRetry}
                      className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#B28E3A', color: '#fff' }}>
                      <Camera size={16} />
                      Try Again
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MANUAL MODE */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#421C3B' }}>
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-1778479984727"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                  style={{ borderColor: '#d1c9b8', backgroundColor: '#fafaf7', color: '#421C3B' }}
                />
                <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>
                  Ask the buyer for their order number shown on checkout
                </p>
              </div>
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim() || status === 'loading'}
                className="w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                style={{
                  backgroundColor: manualInput.trim() && status !== 'loading' ? '#1D5D5D' : '#d1c9b8',
                  color: '#E8E4C9',
                  cursor: manualInput.trim() && status !== 'loading' ? 'pointer' : 'not-allowed'
                }}>
                {status === 'loading'
                  ? <><Loader size={15} className="animate-spin" /> Verifying...</>
                  : '✓ Complete Order'}
              </button>
            </div>
          )}

          {/* Error message */}
          {message && status === 'error' && (
            <div className="mt-4 px-4 py-3 rounded-xl flex items-start gap-2 text-sm font-medium"
              style={{ backgroundColor: '#A3464D22', color: '#A3464D' }}>
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {message}
            </div>
          )}

          {/* Success message */}
          {message && status === 'success' && (
            <div className="mt-4 px-4 py-3 rounded-xl flex items-start gap-2 text-sm font-medium"
              style={{ backgroundColor: '#6F803C22', color: '#6F803C' }}>
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}