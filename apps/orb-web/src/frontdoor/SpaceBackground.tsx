import { type CSSProperties, memo, useMemo } from 'react';

import './SpaceBackground.css';

type StarDescriptor = {
  id: string;
  top: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

type ShootingStarDescriptor = {
  id: string;
  top: number;
  left: number;
  delay: number;
  duration: number;
  angle: number;
};

export interface SpaceBackgroundProps {
  starCount?: number;
  shootingStarCount?: number;
  starHue?: number;
  starSaturation?: number;
  starLightness?: number;
  auroraAlpha?: number;
}

const createStars = (count: number): StarDescriptor[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `star-${index}`,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 0.5 + Math.random() * 2.5,
    opacity: 0.3 + Math.random() * 0.7,
    duration: 6 + Math.random() * 6,
    delay: Math.random() * 8,
  }));

const createShootingStars = (count: number): ShootingStarDescriptor[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `shooting-star-${index}`,
    top: 10 + Math.random() * 60,
    left: Math.random() * 70,
    delay: Math.random() * 12 + index * 2,
    duration: 3 + Math.random() * 2,
    angle: -15 + Math.random() * -20,
  }));

const SpaceBackground = memo(
  ({
    starCount = 140,
    shootingStarCount = 2,
    starHue = 210,
    starSaturation = 65,
    starLightness = 85,
    auroraAlpha = 0.25,
  }: SpaceBackgroundProps) => {
    const stars = useMemo(() => createStars(starCount), [starCount]);
    const shootingStars = useMemo(
      () => createShootingStars(shootingStarCount),
      [shootingStarCount]
    );

    const backgroundStyle = useMemo(
      () =>
        ({
          '--star-hue': `${starHue}`,
          '--star-saturation': `${starSaturation}%`,
          '--star-lightness': `${starLightness}%`,
          '--star-tail-lightness': `${Math.min(starLightness + 7, 95)}%`,
          '--aurora-alpha': `${auroraAlpha}`,
        }) satisfies CSSProperties,
      [auroraAlpha, starHue, starLightness, starSaturation]
    );

    return (
      <div className="space-background" style={backgroundStyle} aria-hidden>
        <div className="space-background__gradient" />
        <div className="space-background__stars">
          {stars.map((star) => (
            <span
              key={star.id}
              className="space-star"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDuration: `${star.duration}s`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="space-background__shooting-stars">
          {shootingStars.map((star) => (
            <span
              key={star.id}
              className="space-shooting-star"
              style={{
                top: `${star.top}%`,
                left: `${star.left}%`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                transform: `rotate(${star.angle}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

SpaceBackground.displayName = 'SpaceBackground';

export default SpaceBackground;

