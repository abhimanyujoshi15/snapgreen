import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import styles from './ShareCard.module.css'

const ShareCard = ({ product, onClose }) => {
  const cardRef = useRef()
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

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
      A: 'Excellent', B: 'Good',
      C: 'Average', D: 'Poor',
      E: 'Very Poor', F: 'Harmful'
    }
    return labels[score] || 'Unknown'
  }

  const getScoreMessage = (score) => {
    const messages = {
      A: 'This is a fantastic eco-friendly choice! 🌍',
      B: 'A solid green choice worth recommending! 🌿',
      C: 'Average impact — room to do better! 🌱',
      D: 'This product has a high environmental cost ⚠️',
      E: 'Consider switching to a greener alternative ❌',
      F: 'One of the most harmful products out there 🚨'
    }
    return messages[score] || ''
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      })
      const link = document.createElement('a')
      link.download = `snapgreen-${product.name.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (err) {
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      })

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'snapgreen-card.png', { type: 'image/png' })

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'SnapGreen Eco Score',
            text: `I scanned ${product.name} and it got an eco score of ${product.ecoScore}! Check out SnapGreen 🌿`,
            files: [file]
          })
        } else {
          // Fallback — just download
          handleDownload()
        }
      })
    } catch (err) {
      console.error('Share error:', err)
    }
  }

  const scoreColor = getScoreColor(product.ecoScore)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <h2 className={styles.modalTitle}>Your Eco Score Card</h2>
        <p className={styles.modalSubtitle}>
          Download and share with friends 📲
        </p>

        {/* The actual card that gets captured */}
        <div ref={cardRef} className={styles.card}>

          {/* Card Header */}
          <div
            className={styles.cardHeader}
            style={{ background: `linear-gradient(135deg, ${scoreColor}, ${scoreColor}cc)` }}
          >
            <div className={styles.cardBrand}>🌿 SnapGreen</div>
            <div className={styles.cardScoreArea}>
              <div className={styles.cardScoreLetter}>{product.ecoScore}</div>
              <div className={styles.cardScoreInfo}>
                <span className={styles.cardScoreLabel}>
                  {getScoreLabel(product.ecoScore)}
                </span>
                <span className={styles.cardScoreSub}>Eco Score</span>
              </div>
            </div>
            <div className={styles.cardOverall}>{product.overallScore}/100</div>
          </div>

          {/* Product Info */}
          <div className={styles.cardBody}>
            <div className={styles.cardProductRow}>
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={styles.cardProductImage}
                  crossOrigin='anonymous'
                />
              )}
              <div>
                <h3 className={styles.cardProductName}>{product.name}</h3>
                <p className={styles.cardProductBrand}>{product.brand}</p>
              </div>
            </div>

            {/* Score Message */}
            <p className={styles.cardMessage}>
              {getScoreMessage(product.ecoScore)}
            </p>

            {/* Mini Score Bars */}
            <div className={styles.cardBars}>
              {[
                { label: 'Packaging', value: product.packagingScore },
                { label: 'Sourcing', value: product.sourcingScore },
                { label: 'Overall', value: product.overallScore },
              ].map(item => (
                <div key={item.label} className={styles.cardBar}>
                  <span className={styles.cardBarLabel}>{item.label}</span>
                  <div className={styles.cardBarTrack}>
                    <div
                      className={styles.cardBarFill}
                      style={{
                        width: `${item.value}%`,
                        background: item.value > 60
                          ? '#4caf50' : item.value > 30
                          ? '#ff9800' : '#f44336'
                      }}
                    />
                  </div>
                  <span className={styles.cardBarValue}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Carbon Footprint */}
            {product.carbonFootprint && (
              <div className={styles.cardCarbon}>
                💨 {product.carbonFootprint}
              </div>
            )}

            {/* Best Alternative */}
            {product.alternatives?.[0] && (
              <div className={styles.cardAlt}>
                <span className={styles.cardAltLabel}>💚 Greener Alternative</span>
                <span className={styles.cardAltName}>
                  {product.alternatives[0].name} by {product.alternatives[0].brand}
                </span>
                <span className={styles.cardAltSaving}>
                  {product.alternatives[0].co2Saved}
                </span>
              </div>
            )}

            {/* Footer */}
            <div className={styles.cardFooter}>
              <span>Scan products at</span>
              <strong>snapgreen.app</strong>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            className={styles.downloadBtn}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? '⏳ Generating...' : downloaded ? '✅ Downloaded!' : '⬇️ Download'}
          </button>
          <button
            className={styles.shareBtn}
            onClick={handleShare}
          >
            📤 Share
          </button>
        </div>

        {/* WhatsApp Share */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `I scanned ${product.name} on SnapGreen and it got an Eco Score of ${product.ecoScore} (${product.overallScore}/100)! 🌿\n\nCarbon Footprint: ${product.carbonFootprint}\n\nCheck your products at snapgreen.app`
          )}`}
          target='_blank'
          rel='noreferrer'
          className={styles.whatsappBtn}
        >
          <span>💬</span> Share on WhatsApp
        </a>

      </div>
    </div>
  )
}

export default ShareCard