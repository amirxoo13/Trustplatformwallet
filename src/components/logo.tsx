import { cn } from "@/lib/utils";
import { useSite } from "@/lib/site-store";

export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  const logo = useSite((s) => s.logo);
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        width={size}
        height={size}
        className={cn("shrink-0 rounded-md object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#2E6BFF" />
      <path
        d="M16 6.5 7.5 10.2v5.4c0 6 3.7 9.4 8.5 10.9 4.8-1.5 8.5-4.9 8.5-10.9v-5.4L16 6.5Z"
        fill="#07080A"
      />
      <path d="M16 11.2v10.2" stroke="#F4F6F8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12.2 14.2h7.6" stroke="#F4F6F8" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function LogoWord({ className }: { className?: string }) {
  const brandName = useSite((s) => s.brandName);
  return (
    <span className={cn("flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight", className)}>
      <LogoMark />
      {brandName}
    </span>
  );
}
