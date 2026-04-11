import { useState } from 'react'
import { useZxing } from 'react-zxing'
import API from '../api'
import { useAuth } from '../context/AuthContext'
import styles from './Scanner.module.css'
import ShareCard from '../components/ShareCard'
import {
  ScanBarcode,
  Camera,
  Search,
  RefreshCw,
  Share2,
  Leaf,
  Info,
  ChevronRight,
  ExternalLink,
  ShoppingBag
} from 'lucide-react'

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
      const res = await API.get(`/api/product/barcode/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProduct(res.data.product)
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found in our green database')
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

    setPhotoPreview(URL.createObjectURL(file))
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
      setError(err.response?.data?.message || 'Gemini AI couldn’t identify this product.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    const colors = {
      A: '#10b981', B: '#84cc16',
      C: '#f59e0b', D: '#f97316',
      E: '#ef4444', F: '#991b1b'
    }
    return colors[score] || '#64748b'
  }

  return (
    <div className={styles.container}>
      {/* --- HEADER SECTION --- */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Eco Scanner</h1>
          <p className={styles.subtitle}>Scan to reveal the environmental truth.</p>
        </div>

        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'barcode' ? styles.activeTab : ''}`}
            onClick={() => { setActiveTab('barcode'); setScanning(false); setError(''); setProduct(null) }}
          >
            <ScanBarcode size={20} />
            <span>Barcode</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'photo' ? styles.activeTab : ''}`}
            onClick={() => { setActiveTab('photo'); setScanning(false); setError(''); setProduct(null) }}
          >
            <Camera size={20} />
            <span>AI Photo</span>
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* --- INPUT METHODS --- */}
        {!product && !loading && (
          <div className={styles.inputSection}>
            {activeTab === 'barcode' ? (
              <div className={styles.barcodeCard}>
                <button
                  className={`${styles.primaryBtn} ${scanning ? styles.pulse : ''}`}
                  onClick={() => { setScanning(!scanning); setError('') }}
                >
                  {scanning ? <RefreshCw className={styles.spin} /> : <ScanBarcode />}
                  {scanning ? 'Stop Camera' : 'Start Scanning'}
                </button>

                {scanning && (
                  <div className={styles.viewportContainer}>
                    <video ref={ref} className={styles.videoFeed} />
                    <div className={styles.scannerOverlay}>
                      <div className={styles.laser} />
                    </div>
                  </div>
                )}

                <form onSubmit={handleManualSearch} className={styles.manualSearch}>
                  <input
                    type="text"
                    placeholder="Enter barcode manually..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                  <button type="submit"><Search size={20} /></button>
                </form>
              </div>
            ) : (
              <label className={styles.photoUploadArea}>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handlePhotoUpload} 
                  hidden 
                />
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.iconCircle}><Camera size={32} /></div>
                  <h3>Take a Photo</h3>
                  <p>Our AI will identify the product & its impact</p>
                </div>
              </label>
            )}
          </div>
        )}

        {/* --- STATUS STATES --- */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.loader}></div>
            <p>{activeTab === 'photo' ? 'Gemini AI is analyzing...' : 'Fetching eco-data...'}</p>
          </div>
        )}

        {error && <div className={styles.errorMessage}><Info size={18} /> {error}</div>}

        {/* --- RESULTS SECTION --- */}
        {product && (
          <div className={styles.resultsContainer}>
            {/* 1. Main Product Card */}
            <div className={styles.productHero}>
              <div className={styles.productMainInfo}>
                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className={styles.prodImg} />}
                <div>
                  <span className={styles.categoryBadge}>{product.category}</span>
                  <h2 className={styles.prodName}>{product.name}</h2>
                  <p className={styles.prodBrand}>{product.brand}</p>
                </div>
              </div>

              <div 
                className={styles.scoreCircle} 
                style={{ '--score-color': getScoreColor(product.ecoScore) }}
              >
                <div className={styles.scoreInner}>
                  <span className={styles.scoreLetter}>{product.ecoScore}</span>
                  <span className={styles.scorePercent}>{product.overallScore}/100</span>
                </div>
              </div>
            </div>

            {/* 2. Impact Summary */}
            <section className={styles.infoCard}>
              <h3 className={styles.cardTitle}><Leaf size={18} /> Impact Insight</h3>
              <p className={styles.impactText}>{product.impactSummary}</p>
              {product.funFact && (
                <div className={styles.factBox}>
                  <strong>Did you know?</strong> {product.funFact}
                </div>
              )}
            </section>

            {/* 3. Detailed Scores Grid */}
            <div className={styles.scoreGrid}>
              {[
                { label: 'Packaging', val: product.packagingScore, icon: '📦' },
                { label: 'Sourcing', val: product.sourcingScore, icon: '🌱' },
                { label: 'Carbon', val: product.carbonFootprint, icon: '💨', isText: true }
              ].map((item, idx) => (
                <div key={idx} className={styles.gridItem}>
                  <span className={styles.gridIcon}>{item.icon}</span>
                  <span className={styles.gridLabel}>{item.label}</span>
                  <span className={styles.gridVal}>{item.isText ? item.val : `${item.val}/100`}</span>
                </div>
              ))}
            </div>

            {/* 4. Alternatives Section */}
            {product.alternatives?.length > 0 && (
              <section className={styles.alternativesSection}>
                <h3 className={styles.cardTitle}>Better for the Planet</h3>
                <div className={styles.altList}>
                  {product.alternatives.map((alt, i) => (
                    <div key={i} className={styles.altCard}>
                      <div className={styles.altHeader}>
                        <div className={styles.altScore} style={{ background: getScoreColor(alt.ecoScore) }}>
                          {alt.ecoScore}
                        </div>
                        <div className={styles.altMeta}>
                          <strong>{alt.name}</strong>
                          <span>{alt.brand} • {alt.estimatedPrice}</span>
                        </div>
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(alt.searchQuery + ' buy India')}`}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.buyBtn}
                        >
                          <ShoppingBag size={16} />
                        </a>
                      </div>
                      <p className={styles.altReason}>{alt.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Actions */}
            <div className={styles.actionFooter}>
              <button className={styles.resetBtn} onClick={() => { setProduct(null); setPhotoPreview(null) }}>
                <RefreshCw size={18} /> Scan Another
              </button>
              <button className={styles.shareBtn} onClick={() => setShowShareCard(true)}>
                <Share2 size={18} /> Share Result
              </button>
            </div>
          </div>
        )}
      </main>

      {showShareCard && (
        <ShareCard product={product} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  )
}

export default Scanner