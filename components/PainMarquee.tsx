'use client';

import { Sparkles } from 'lucide-react';
import { painPoints } from '@/lib/content';

/**
 * Continuously scrolling row of pain points. The list is rendered twice so the
 * -50% translate loops seamlessly; it pauses on hover and stops entirely for
 * anyone who has asked for reduced motion.
 */
export function PainMarquee() {
  const track = [...painPoints, ...painPoints];

  return (
    <div
      className="group relative overflow-hidden py-1"
      style={{
        maskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <div
        className="flex w-max animate-marquee gap-3 group-hover:[animation-play-state:paused]
                   motion-reduce:animate-none motion-reduce:overflow-x-auto"
      >
        {track.map((p, i) => (
          <span
            key={`${p}-${i}`}
            aria-hidden={i >= painPoints.length}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border
                       border-espresso-900/10 bg-white/80 px-4 py-2.5 text-[13.5px]
                       text-espresso-900/70 shadow-lift-sm"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-500" />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
