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
  Package
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

      const res = await API.post(
        '/api/product/photo',
        { imageBase64: base64, mimeType: file.type }
      )

      setProduct(res.data.product)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not identify product')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    const colors = {
      A: '#2e7d32', B: '#558b2f',
      C: '#f9a825', D: '#e65100',
      E: '#b71c1c', F: '#b71c1c'
    }
    return colors[score] || '#888'
  }

  const getScoreLabel = (score) => {
    const labels = {
      A: 'Excellent 🌟', B: 'Good 👍',
      C: 'Average 😐', D: 'Poor 👎',
      E: 'Very Poor ⚠️', F: 'Harmful ❌'
    }
    return labels[score] || 'Unknown'
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🌿 Scan a Product</h1>
      <p className={styles.subtitle}>Check the eco impact of any product</p>

      {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'barcode' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('barcode'); setScanning(false); setProduct(null); setError('') }}
            >
              <ScanBarcode size={16} /> Barcode
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'photo' ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab('photo'); setScanning(false); setProduct(null); setError('') }}
            >
              <Camera size={16} /> Photo
            </button>
          </div>

      {/* Barcode Tab */}
      {activeTab === 'barcode' && (
        <div>
          {/* Scan Button */}
              <button
                className={`${styles.scanButton} ${scanning ? styles.scanning : ''}`}
                onClick={() => { setScanning(!scanning); setError(''); setProduct(null) }}
              >
                {scanning
                  ? <><RefreshCw size={18} /> Stop Scanning</>
                  : <><Camera size={18} /> Start Camera Scanner</>
                }
              </button>


          {scanning && (
            <div className={styles.cameraWrapper}>
              <video ref={ref} className={styles.camera} />
              <div className={styles.scanOverlay}>
                <div className={styles.scanLine} />
              </div>
              <p className={styles.cameraHint}>Point camera at a barcode</p>
            </div>
          )}

          <form onSubmit={handleManualSearch} className={styles.manualForm}>
            <input
              type='text'
              placeholder='Or enter barcode manually...'
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className={styles.input}
            />
            <button type='submit' className={styles.searchButton}>
              <Search size={18} />
              Search
            </button>
          </form>
        </div>
      )}

      {/* Photo Tab */}
      {activeTab === 'photo' && (
        <div className={styles.photoTab}>
          <label className={styles.photoUploadLabel}>
            <input
              type='file'
              accept='image/*'
              capture='environment'
              onChange={handlePhotoUpload}
              className={styles.photoInput}
            />
            <div className={styles.photoUploadBox}>
              {photoPreview ? (
                <img src={photoPreview} alt='Preview' className={styles.photoPreview} />
              ) : (
                <>
                  <span className={styles.photoIcon}>📷</span>
                  <p>Click to take a photo or upload</p>
                  <span className={styles.photoHint}>Gemini AI will identify the product</span>
                </>
              )}
            </div>
          </label>

          {photoPreview && !loading && (
              <button
                className={styles.retakeButton}
                onClick={() => { setPhotoPreview(null); setProduct(null); setError('') }}
              >
                <RefreshCw size={16} /> Scan Another
              </button>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>{activeTab === 'photo' ? 'Gemini is identifying product...' : 'Fetching product data...'}</p>
        </div>
      )}

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Product Card */}
      {product && (
        <div className={styles.productCard}>

          {/* Product Header */}
          <div className={styles.productHeader}>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={styles.productImage}
              />
            )}
            <div className={styles.productInfo}>
              <h2 className={styles.productName}>{product.name}</h2>
              <p className={styles.productBrand}>{product.brand}</p>
              <p className={styles.productCategory}>📦 {product.category}</p>
            </div>
          </div>

          {/* Eco Score Hero */}
          <div
            className={styles.ecoScoreHero}
            style={{ background: `linear-gradient(135deg, ${getScoreColor(product.ecoScore)}, ${getScoreColor(product.ecoScore)}cc)` }}
          >
            <div className={styles.ecoScoreLeft}>
              <span className={styles.ecoScoreLetter}>{product.ecoScore}</span>
              <div>
                <span className={styles.ecoScoreLabel}>{getScoreLabel(product.ecoScore)}</span>
                <span className={styles.ecoScoreSub}>Eco Score</span>
              </div>
            </div>
            <div className={styles.ecoScoreRight}>
              <span className={styles.overallScore}>{product.overallScore}</span>
              <span className={styles.overallScoreLabel}>/ 100</span>
            </div>
          </div>

          {/* Impact Summary */}
          {product.impactSummary && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>🌍 Environmental Impact</h3>
              <p className={styles.impactText}>{product.impactSummary}</p>
            </div>
          )}

          {/* Fun Fact */}
          {product.funFact && (
            <div className={styles.funFact}>
              <span>💡</span>
              <p><strong>Did you know?</strong> {product.funFact}</p>
            </div>
          )}

          {/* Score Bars */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>📊 Detailed Scores</h3>
            <div className={styles.scoreBars}>
              {[
                { label: '📦 Packaging', value: product.packagingScore, detail: product.packagingDetail },
                { label: '🌱 Sourcing', value: product.sourcingScore, detail: product.sourcingDetail },
                { label: '🏭 Overall', value: product.overallScore, detail: product.manufacturingDetail },
              ].map((item) => (
                <div key={item.label} className={styles.scoreBarGroup}>
                  <div className={styles.scoreBar}>
                    <span className={styles.scoreBarLabel}>{item.label}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.value > 60
                            ? '#4caf50' : item.value > 30
                            ? '#ff9800' : '#f44336'
                        }}
                      />
                    </div>
                    <span className={styles.scoreBarValue}>{item.value}/100</span>
                  </div>
                  {item.detail && (
                    <p className={styles.scoreDetail}>{item.detail}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carbon Footprint */}
          {product.carbonFootprint && (
            <div className={styles.carbonBox}>
              <div className={styles.carbonIcon}>💨</div>
              <div>
                <strong>Carbon Footprint</strong>
                <p>{product.carbonFootprint}</p>
              </div>
            </div>
          )}

          {/* Tips */}
          {product.tips?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>♻️ How to Reduce Impact</h3>
              <div className={styles.tips}>
                {product.tips.map((tip, i) => (
                  <div key={i} className={styles.tip}>
                    <span className={styles.tipNumber}>{i + 1}</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Greener Alternatives */}
          {product.alternatives?.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>💚 Greener Indian Alternatives</h3>
              <p className={styles.altSubtitle}>Switch to these for a smaller carbon footprint</p>
              {product.alternatives.map((alt, i) => (
                <div key={i} className={styles.altCard}>

                  {/* Alt Header */}
                  <div className={styles.altHeader}>
                    <div
                      className={styles.altScoreBadge}
                      style={{ backgroundColor: getScoreColor(alt.ecoScore) }}
                    >
                      {alt.ecoScore}
                    </div>
                    <div className={styles.altTitleGroup}>
                      <strong className={styles.altName}>{alt.name}</strong>
                      <span className={styles.altBrand}>{alt.brand}</span>
                    </div>
                    <div className={styles.altScoreNum}>
                      <span>{alt.overallScore}</span>
                      <small>/100</small>
                    </div>
                  </div>

                  {/* Key Benefit Tag */}
                  {alt.keyBenefit && (
                    <div className={styles.keyBenefit}>
                      🌿 {alt.keyBenefit}
                    </div>
                  )}

                  {/* Reason */}
                  <p className={styles.altReason}>{alt.reason}</p>

                  {/* CO2 Saved */}
                  <div className={styles.co2Saved}>
                    🍃 {alt.co2Saved}
                  </div>

                  {/* Price & Where to Buy */}
                  <div className={styles.altMeta}>
                    {alt.estimatedPrice && (
                      <div className={styles.altPrice}>
                        <span className={styles.altMetaLabel}>💰 Price</span>
                        <span className={styles.altMetaValue}>{alt.estimatedPrice}</span>
                      </div>
                    )}
                    {alt.whereToBuy?.length > 0 && (
                      <div className={styles.altWhere}>
                        <span className={styles.altMetaLabel}>🛒 Available at</span>
                        <div className={styles.whereTags}>
                          {alt.whereToBuy.map((place, j) => (
                            <span key={j} className={styles.whereTag}>{place}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Button */}
                  {alt.searchQuery && (
                      <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(alt.searchQuery + ' buy online India')}`}
                      target='_blank'
                      rel='noreferrer'
                      className={styles.searchBtn}
                    >
                      🔍 Find & Buy Online
                    </a>
                  )}

                </div>

                
              ))}
            </div>
          )}

        </div>

        
      )}

      {/* Share Button */}
        <div className={styles.shareSection}>
          <button
            className={styles.shareCardBtn}
            onClick={() => setShowShareCard(true)}
          >
            <Share2 size={18} /> Share My Eco Score Card
          </button>
        </div>

      {/* Share Card Modal */}
      {showShareCard && (
        <ShareCard
          product={product}
          onClose={() => setShowShareCard(false)}
        />
    )}
    </div>
  )
}

export default Scanner