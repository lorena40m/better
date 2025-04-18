import { useEffect } from 'react'
import Typed from 'typed.js'

const TypingEffect = ({ strings }) => {
  useEffect(() => {
    const options = {
      strings: strings,
      typeSpeed: 80,
      backSpeed: 40,
      showCursor: true,
      loop: true,
    }
    const typed = new Typed('#typed-output', options)
    return () => {
      typed.destroy()
    }
  }, [strings])

  return <span id="typed-output"></span>
}

export default TypingEffect
