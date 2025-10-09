import React, { useEffect, useRef, useState } from 'react';
import './ScrambledText.css';

// Simple scrambled-text animation inspired by common implementations
export default function ScrambledText({ text = '', duration = 1800, fps = 60, charset, className = '' }) {
  const [display, setDisplay] = useState('');
  const rafRef = useRef(null);
  const startRef = useRef(null);

  // Default charset: letters, digits and some symbols
  const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{};:\\",.<>/?';
  const chars = charset || defaultCharset;

  useEffect(() => {
    const target = Array.from(text);
    const totalFrames = Math.max(1, Math.round((duration / 1000) * fps));
    let frame = 0;

    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      frame = Math.min(totalFrames, Math.floor((elapsed / duration) * totalFrames));

      // reveal progress from 0..1
      const progress = Math.min(1, elapsed / duration);

      const revealCount = Math.floor(progress * target.length);

      // build output: first revealCount chars are the real char, others random
      let out = '';
      for (let i = 0; i < target.length; i++) {
        if (i < revealCount) {
          out += target[i];
        } else if (target[i] === ' ') {
          out += ' ';
        } else {
          out += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }

      setDisplay(out);

      if (elapsed < duration) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        setDisplay(text); // ensure final
        startRef.current = null;
        rafRef.current = null;
      }
    }

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [text, duration, fps, chars]);

  return (
    <span className={`scrambled-text ${className}`} aria-label={text}>
      {Array.from(display).map((ch, i) => (
        <span key={i} className={`scr-ch ${ch === text[i] ? 'revealed' : 'scrambled'}`}>
          {ch}
        </span>
      ))}
    </span>
  );
}
