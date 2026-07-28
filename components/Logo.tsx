import Image from 'next/image';

/** Katie's real logo mark, saved from her Facebook page. */
export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-full bg-espresso-950 ${className}`}
    >
      <Image src="/logo.jpg" alt="" fill sizes="96px" className="object-cover" priority />
    </span>
  );
}

export function Logo({
  className = '',
  tone = 'dark',
}: {
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-10 w-10 sm:h-11 sm:w-11" />
      <span className="flex flex-col leading-none">
        <span
          className={`h-display text-[17px] tracking-tight sm:text-[19px] ${
            tone === 'light' ? 'text-cream-50' : 'text-espresso-950'
          }`}
        >
          Maple Glow
        </span>
        <span
          className={`mt-1 text-[9.5px] font-bold uppercase tracking-[0.22em] ${
            tone === 'light' ? 'text-gold-300/85' : 'text-gold-600'
          }`}
        >
          Cleaning LLC
        </span>
      </span>
    </span>
  );
}
