export const HERO_FRAME_COUNT = 626

export const getHeroFrameSrc = (index) =>
  `/assets/video-frames/hero-sequence/frame-${String(index + 1).padStart(4, '0')}.webp`
