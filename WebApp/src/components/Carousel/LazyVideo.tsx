import { useEffect, useRef, useState } from 'react'

const LazyVideo = ({ src }) => {
  const videoRef = useRef(null)
  const [isInView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  return (
    <video ref={videoRef} width="500" height="500" controls>
      {isInView && <source src={src} type="video/mp4" />}
    </video>
  )
}

export default LazyVideo
