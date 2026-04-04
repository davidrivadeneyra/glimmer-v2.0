// ScrollSlider.js
'use client'
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next'

const ScrollSlider = () => {
  const { t } = useTranslation()
  const imageAlt = t('scrollSlider.imageAlt', { returnObjects: true })
  const fisrtSlider = useRef(null);
  const secondSlider = useRef(null);
  const slider = useRef(null);
  const xPercent = useRef(0);
  const direction = useRef(-1);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const animation = () => {
      if (xPercent.current <= -100) {
        xPercent.current = 0;
      }
      if (xPercent.current > 0) {
        xPercent.current = -100;
      }
      gsap.set(fisrtSlider.current, { xPercent: xPercent.current });
      gsap.set(secondSlider.current, { xPercent: xPercent.current });
      xPercent.current += 0.02 * direction.current;
      requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);

    gsap.to(slider.current, {
      scrollTrigger: {
        trigger: document.documentElement,
        start: 0,
        end: window.innerHeight,
        scrub: 0.25,
        onUpdate: (e) => {
          direction.current = e.direction * -1
        },
      },
      x: "300px",
    });
  }, []);

  return (
    <div ref={slider} className="slider-container">
      <div ref={fisrtSlider} className="slider">
        <img className="slider-img" src="/banner/dawn-desktop.png" alt={imageAlt[0]} />
        <img className="slider-img" src="/banner/agrosol-desktop.png" alt={imageAlt[1]} />
        <img className="slider-img" src="/banner/crafttool-mobile.png" alt={imageAlt[2]} />
        <img className="slider-img" src="/banner/dawn-mobile.png" alt={imageAlt[3]} />
        <img className="slider-img" src="/banner/edteam-desktop.png" alt={imageAlt[4]} />
        <img className="slider-img" src="/banner/martin-desktop.png" alt={imageAlt[5]} />
        <img className="slider-img" src="/banner/crafttool-mobile-2.png" alt={imageAlt[6]} />
      </div>
      <div ref={secondSlider} className="slider">
        <img className="slider-img" src="/banner/dawn-desktop.png" alt={imageAlt[0]} />
        <img className="slider-img" src="/banner/agrosol-desktop.png" alt={imageAlt[1]} />
        <img className="slider-img" src="/banner/crafttool-mobile.png" alt={imageAlt[2]} />
        <img className="slider-img" src="/banner/dawn-mobile.png" alt={imageAlt[3]} />
        <img className="slider-img" src="/banner/edteam-desktop.png" alt={imageAlt[4]} />
        <img className="slider-img" src="/banner/martin-desktop.png" alt={imageAlt[5]} />
        <img className="slider-img" src="/banner/crafttool-mobile-2.png" alt={imageAlt[6]} />
      </div>
    </div>
  );
};

export default ScrollSlider;
