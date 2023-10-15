import React, { useEffect } from 'react';
import Typed from 'typed.js';

const TypingEffect = ({ strings }) => {
  useEffect(() => {
    const options = {
      strings: strings,
      typeSpeed: 80,
      backSpeed: 40,
	  showCursor: false,
      loop: true
    };
    const typed = new Typed("#typed-output", options);
    return () => {
      typed.destroy();
    };
  }, [strings]);

  return (
	<span className="gradientText" id="typed-output"></span>
  );
};

export default TypingEffect;
