import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollSequenceCanvas.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

interface ScrollSequenceCanvasProps {
  folderPath: string; // e.g., '/hero_images/'
  fileNameGenerator: (frameIndex: number) => string; // e.g., (index) => `ezgif-frame-${String(index).padStart(3, '0')}.jpg`
  totalFrames: number; // e.g., 51
  scrollDistance?: string; // e.g., '300%' (how long the pin stays locked)
}

export const ScrollSequenceCanvas: React.FC<ScrollSequenceCanvasProps> = ({
  folderPath,
  fileNameGenerator,
  totalFrames,
  scrollDistance = '250%'
}) => {
  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const collectionTitleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Performance Refs (avoids React re-renders)
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrameRef = useRef<number>(-1);
  const animationFrameIdRef = useRef<number>(0);
  const animStateRef = useRef({ frame: 0 });

  // Component State (used only for preloader UX)
  const [isFirstFrameLoaded, setIsFirstFrameLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  // Helper: Normalize folder path structure
  const getImageUrl = (index: number) => {
    const base = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    return `${base}${fileNameGenerator(index)}`;
  };

  // 1. Aspect ratio covering drawing logic (with devicePixelRatio retina scaling)
  const drawFrame = (frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!ctx || !img) return;

    // Track previous drawn frame to prevent duplicate paint actions
    if (frameIndex === lastDrawnFrameRef.current) return;
    lastDrawnFrameRef.current = frameIndex;

    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    // Calculate object-fit: cover sizing relative to CSS viewport limits
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = cssWidth / cssHeight;

    let drawWidth = cssWidth;
    let drawHeight = cssHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = cssHeight * imgRatio;
      offsetX = (cssWidth - drawWidth) / 2;
    } else {
      drawHeight = cssWidth / imgRatio;
      offsetY = (cssHeight - drawHeight) / 2;
    }

    // Canvas rendering using scaled context dimensions
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // requestAnimationFrame rendering scheduler
  const scheduleDraw = (frameIndex: number) => {
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = requestAnimationFrame(() => {
      drawFrame(frameIndex);
    });
  };

  // 2. High-reliability preloader
  useEffect(() => {
    let active = true;
    let loadedCount = 0;

    // A. Preload the first frame immediately for instant visual rendering
    const firstImg = new Image();
    firstImg.src = getImageUrl(1);

    firstImg.onload = () => {
      if (!active) return;
      imagesRef.current[0] = firstImg;
      setIsFirstFrameLoaded(true);

      // Trigger background preloading for the remaining frames
      preloadRemainingFrames();
    };

    firstImg.onerror = () => {
      console.error('Failed to load first frame');
      if (!active) return;
      // Fallback: try loading remaining frames anyway
      preloadRemainingFrames();
    };

    const preloadRemainingFrames = () => {
      // Set initial progress reflecting the first frame loading
      loadedCount = 1;
      setLoadProgress(Math.round((1 / totalFrames) * 100));

      for (let i = 2; i <= totalFrames; i++) {
        const img = new Image();
        img.src = getImageUrl(i);

        img.onload = () => {
          if (!active) return;
          imagesRef.current[i - 1] = img;
          handleFrameLoaded();
        };

        img.onerror = () => {
          console.warn(`Failed loading sequence frame index: ${i}`);
          if (!active) return;
          // Put undefined/empty entry to prevent array index mismatch, but increment loaded progress count
          handleFrameLoaded();
        };
      }
    };

    const handleFrameLoaded = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / totalFrames) * 100);
      setLoadProgress(percent);

      if (loadedCount === totalFrames && active) {
        setIsLoaded(true);
      }
    };

    return () => {
      active = false;
    };
  }, [folderPath, totalFrames]);

  // 3. Canvas resize logic with Retina devicePixelRatio adjustments
  useEffect(() => {
    if (!isFirstFrameLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.innerWidth;
      const cssHeight = window.innerHeight;

      // Update physical backing store dimensions for high DPI retina screens
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;

      // Scale back to CSS pixels so drawings don't need manual dpr multiplication
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transforms first
      ctx.scale(dpr, dpr);

      // Re-draw current frame matching scaled limits
      drawFrame(animStateRef.current.frame);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup call

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isFirstFrameLoaded]);

  // 4. GSAP Context & ScrollTrigger timeline binding
  useEffect(() => {
    // Wait until background frames are loaded to hook up GSAP controllers
    if (!isLoaded || !containerRef.current || !canvasRef.current) return;

    const ctx = gsap.context(() => {
      const animState = animStateRef.current;

      // Set initial states
      gsap.set(heroTitleRef.current, { opacity: 1, y: 0 });
      gsap.set(collectionTitleRef.current, { opacity: 0, y: 30 });
      gsap.set(descriptionRef.current, { opacity: 0, y: 20 });
      gsap.set(ctaRef.current, { opacity: 0, y: 20 });

      // Create a single main timeline that pins the container and scrubs
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            // Force draw bounding frames to handle scroll limit edge cases cleanly
            if (self.progress <= 0.005) {
              animState.frame = 0;
              scheduleDraw(0);
            } else if (self.progress >= 0.995) {
              animState.frame = totalFrames - 1;
              scheduleDraw(totalFrames - 1);
            }
          }
        }
      });

      // 1. Canvas frame animation sequence (spans 0-100 of the timeline duration)
      mainTl.to(animState, {
        frame: totalFrames - 1,
        ease: 'none',
        duration: 100,
        onUpdate: () => {
          scheduleDraw(Math.round(animState.frame));
        }
      }, 0);

      // 2. Overlay Text animations synchronized by percentage of scroll:
      // 0-20%: Hero title remains fully visible

      // 20-40%: Hero title fades out
      mainTl.to(heroTitleRef.current, {
        opacity: 0,
        y: -30,
        duration: 20,
        ease: 'power1.inOut'
      }, 20);

      // 40-60%: Collection title fades in
      mainTl.to(collectionTitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 20,
        ease: 'power1.inOut'
      }, 40);

      // 60-80%: Description appears
      mainTl.to(descriptionRef.current, {
        opacity: 1,
        y: 0,
        duration: 20,
        ease: 'power1.inOut'
      }, 60);

      // 80-100%: Shop Now button appears
      mainTl.to(ctaRef.current, {
        opacity: 1,
        y: 0,
        duration: 20,
        ease: 'power1.inOut'
      }, 80);
    }, containerRef);

    return () => {
      // Reverts and kills all GSAP scroll triggers and timelines automatically
      ctx.revert();
    };
  }, [isLoaded, totalFrames, scrollDistance]);

  return (
    <div ref={containerRef} className="scroll-sequence-container">
      {/* Preloader overlay (displayed until first frame is loaded) */}
      {!isLoaded && (
        <div className="sequence-loader-screen glass-panel">
          <div className="loader-box-content">
            <span className="serif-text loader-brand">zenelait</span>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${loadProgress}%` }} />
            </div>
            <p className="progress-percentage-label">Preloading Collection Reveal: {loadProgress}%</p>
          </div>
        </div>
      )}

      {/* Render Canvas (Starts drawing as soon as First Frame is preloaded) */}
      {isFirstFrameLoaded && <canvas ref={canvasRef} className="sequence-canvas" />}

      {/* Overlay Stage Contents */}
      {isLoaded && (
        <div className="sequence-overlay-content-wrapper container">
          {/* Hero Title (0-20% visible, 20-40% fades out) */}
          <div ref={heroTitleRef} className="hero-title-stage overlay-stage-panel">
            <span className="badge badge-gold mb-3">zenelait Haute Couture</span>
            <h1 className="serif-text stage-title-text">
              The Art of <br />
              <span>Fluid Design</span>
            </h1>
            <div className="scroll-hint-indicator">
              <span className="scroll-hint-dot"></span>
              <span>SCROLL</span>
            </div>
          </div>

          {/* Collection Stage (40-100% build-up) */}
          <div className="collection-stage overlay-stage-panel">
            <div ref={collectionTitleRef} style={{ opacity: 0 }}>
              <span className="badge badge-new mb-3">Material Innovation</span>
              <h2 className="serif-text stage-title-text">100% Pure Silk & Cashmere</h2>
            </div>
            <p ref={descriptionRef} className="stage-desc-text" style={{ opacity: 0 }}>
              Woven in Italy, tailored for absolute presence and architectural comfort.
            </p>
            <div ref={ctaRef} className="stage-ctas-row" style={{ opacity: 0 }}>
              <a href="#shop_by_category" className="btn-premium btn-premium-gold">Shop Collection</a>
              <a href="/search" className="btn-premium btn-premium-secondary">Explore All</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ScrollSequenceCanvas;
