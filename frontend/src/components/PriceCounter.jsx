import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';

export const inr = (v) => `₹${Math.round(v).toLocaleString('en-IN')}`;

export default function PriceCounter({ from, to, duration = 2.4, className = '', testid }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-12% 0px' });
  const [val, setVal] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, from, to, duration]);

  return (
    <span ref={ref} data-testid={testid} className={className}>
      {inr(val)}
    </span>
  );
}
