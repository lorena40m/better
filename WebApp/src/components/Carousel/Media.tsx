import Image from 'next/image'
import * as React from 'react'
import LazyVideo from './LazyVideo'

async function getMediaType(url) {
  const response = await fetch(url, { method: 'HEAD' })
  if (!response.ok) throw new Error('Impossible de récupérer le fichier')

  const contentType = response.headers.get('Content-Type')
  if (contentType.startsWith('image/')) return 'image'
  if (contentType.startsWith('video/')) return 'video'
  if (contentType.startsWith('audio/')) return 'audio'
  return null
}

function Media({ src }) {
  const [mediaType, setMediaType] = React.useState(null)

  React.useEffect(() => {
    getMediaType(src)
      .then(type => setMediaType(type))
      .catch(error => console.error('Erreur de requête', error))
  }, [src])

  if (!mediaType) return <div>Chargement...</div>

  switch (mediaType) {
    case 'image':
      return (
        <Image
          src={src}
          alt="crypto"
          style={{
            objectFit: 'cover',
            borderRadius: '10px',
          }}
        />
      )
    case 'video':
      return <LazyVideo src={src} />
    case 'audio':
      return (
        <audio
          src={src}
          controls
          style={{
            width: '100%', // Adjust as needed
            borderRadius: '10px',
          }}
        />
      )
    default:
      return <div>Format non pris en charge</div>
  }
}

export default Media
