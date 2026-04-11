import { useState } from 'react'
import { useZxing } from 'react-zxing'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import ShareCard from '../components/ShareCard'
import {
  ScanBarcode, Camera, Search, RefreshCw, Share2, X
} from 'lucide-react'
import styles from './Scanner.module.css'

const Scanner = () => {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState('barcode')
  const [scanning, setScanning] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [showShareCard, setShowShareCard] = useState(false)

  const { ref } = useZxing({
    onDecodeResult(result) {
      const scanned = result.getText()
      setBarcode(scanned)
      setScanning(false)
      fetchByBarcode(scanned)
    },
    paused: !scanning
  })

  const fetchByBarcode = async (code) => {
    setLoading(true)
    setError('')
    setProduct(null)
    try {
      const res = await API.get(`/api/product/barcode/${code}`)
      setProduct(res.data.product)
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSearch = (e) => {
    e.preventDefault()
    if (barcode.trim()) fetchByBarcode(barcode.trim())
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)
    setError('')
    setProduct(null)
    setLoading(true)

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await API.post('/api/product/photo', {
        imageBase64: base64,
        mimeType: file.type
      })

      setProduct(res.data.product)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not identify product')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    const colors = {
      A: '#2e7d32',
      B: '#558b2f',
      C: '#f9a825',
      D: '#e65100',
      E: '#b71c1c',
      F: '#b71c1c'
    }
    return colors[score] || '#888'
  }

  const getScoreLabel = (score) => {
    const labels = {
      A: 'Excellent 🌟',
      B: 'Good 👍',
      C: 'Average 😐',
      D: 'Poor 👎',
      E: 'Very Poor ⚠️',
      F: 'Harmful ❌'
    }
    return labels[score] || 'Unknown'
  }

  const resetScan = () => {
    setProduct(null)
    setError('')
    setBarcode('')
    setPhotoPreview(null)
    setScanning(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Scan a Product</h1>
          <p className={styles.pageSubtitle}>
            Instantly check the eco impact of any product
          </p>
        </div>
        {product && (
          <button className={styles.newScanBtn} onClick={resetScan}>
            <RefreshCw size={15} /> New Scan
          </button>
        )}
      </div>

      {!product && (
        <div className={styles.scanArea}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'barcode' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('barcode'); setScanning(false); setError('') }}
            >
              <ScanBarcode size={16} /> Barcode
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'photo' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('photo'); setScanning(false); setError('') }}
            >
              <Camera size={16} /> Photo
            </button>
          </div>

          {activeTab === 'barcode' && (
            <div className={styles.barcodePanel}>
              <button
                className={`${styles.scanButton} ${scanning ? styles.scanning : ''}`}
                onClick={() => { setScanning(!scanning); setError('') }}
              >
                {scanning
                  ? <><X size={18} /> Stop Camera</>
                  : <><Camera size={18} /> Start Camera Scanner</>
                }
              </button>

              {scanning && (
                <div className={styles.cameraWrapper}>
                  <video ref={ref} className={styles.camera} />
                </div>
              )}

              <form onSubmit={handleManualSearch}>
                <input
                  type='text'
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
                <button type='submit'>Search</button>
              </form>
            </div>
          )}

          {activeTab === 'photo' && (
            <div>
              <input type='file' accept='image/*' onChange={handlePhotoUpload} />
              {photoPreview && <img src={photoPreview} alt='preview' />}
            </div>
          )}

          {error && <div>{error}</div>}
        </div>
      )}

      {loading && <div>Loading...</div>}

      {product && (
        <div>
          <h2>{product.name}</h2>

          {product.alternatives?.map((alt, i) => (
            <div key={i}>
              <strong>{alt.name}</strong>

              {alt.searchQuery && (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(
                    alt.searchQuery + ' buy online India'
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Search size={14} /> Find & Buy Online
                </a>
              )}
            </div>
          ))}

          <button onClick={() => setShowShareCard(true)}>
            <Share2 size={17} /> Share
          </button>
        </div>
      )}

      {showShareCard && (
        <ShareCard product={product} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  )
}

export default Scanner