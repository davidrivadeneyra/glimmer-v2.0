export const OPPORTUNITY_FRAME_COUNT = 360

export const getOpportunityFrameSrc = (index) =>
  `/assets/video-frames/oportunity/frame-${String(index + 1).padStart(4, '0')}.webp`
