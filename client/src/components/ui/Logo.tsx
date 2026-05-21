import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Replace logo: put your image at /public/logo.png — it auto-renders here */}
        <Image
          src="/logo.png"
          alt="ChatLax"
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const fallback = el.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <span
          className="absolute inset-0 items-center justify-center bg-gradient-to-br from-[#e0e0e0] to-[#888] text-[#0a0a0a] font-bold hidden"
          style={{ fontSize: size * 0.45, fontFamily: 'Syne, sans-serif' }}
          aria-hidden="true"
        >
          C
        </span>
      </div>
      {showText && (
        <span
          className="font-bold text-[#e0e0e0] tracking-tight"
          style={{ fontSize: size * 0.55, fontFamily: 'Syne, sans-serif' }}
        >
          ChatLax
        </span>
      )}
    </div>
  );
}
