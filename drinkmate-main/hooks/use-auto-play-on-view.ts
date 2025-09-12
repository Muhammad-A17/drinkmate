import { useEffect, useRef } from "react";

export function useAutoPlayOnView<T extends HTMLVideoElement>() {
  const ref = useRef<T | null>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { 
          el.play().catch(() => {}); 
        } else { 
          el.pause(); 
        }
      }, 
      { threshold: 0.6 }
    );
    
    io.observe(el);
    return () => io.disconnect();
  }, []);
  
  return ref;
}
