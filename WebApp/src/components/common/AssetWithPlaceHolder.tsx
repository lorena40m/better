import { useState, useEffect, useRef, CSSProperties } from 'react'
import Image from "next/image"

// TODO: Use React Query

type Props = {
  sources: string[],
  alt: string,
  defaultSource: string,
  defaultAlt: string,
  style?: CSSProperties,
  [key: string]: any,
}

const accept = response => !response.url.startsWith('https://services.tzkt.io') ||
  response.headers.has('last-modified')

export default function AssetWithPlaceHolder(
  { sources, alt, defaultSource, defaultAlt, style, ...attr }: Props
) {
  if (alt === 'hDAO') console.log(sources)

  const [loaded, setLoaded] = useState(false)
  const [source, setSource] = useState(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const tryNextSource = (sources: string[], accept?: (response: Response) => boolean) => {
    if (sources.length === 0) {
      setSource(defaultSource)
      return
    }

    const nextSource = sources[0]

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    fetch(nextSource, { method: 'HEAD', signal })
      .then(response => {
        if (response.ok && (!accept || accept(response))) {
          setSource(nextSource)
        } else {
          console.warn(`Failed to fetch image '${nextSource}': ${response.status}`)
          tryNextSource(sources.slice(1), accept)
        }
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        console.warn(`Failed to fetch image '${nextSource}': ${err}`)
        tryNextSource(sources.slice(1), accept)
      })
  }

  useEffect(() => {
    tryNextSource(sources, accept)

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [sources])

  return <div style={{ position: 'relative', ...style }} {...attr}>
    {!loaded && <div className="RoundedPlaceHolder" style={{ width: '100%', height: '100%' }} />}
    {source && <Image src={source} alt={source === defaultSource ? defaultAlt : alt} fill={true}
      onLoad={() => setLoaded(true)}
      style={{
        position: 'absolute', width: '100%', height: '100%',
        visibility: loaded ? 'visible' : 'hidden',
      }}
    />}
  </div>
}
