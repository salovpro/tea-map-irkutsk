type Props = {
  className?: string;
  title: string;
};

/**
 * 2023 РСХБ lockup: three bars + wordmark. Inline so Roboto (Cyrillic)
 * paints the letters; a raster/img SVG would drop the webfont.
 */
export function RshbLogo({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 236 48"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect x="0" y="6" width="10" height="36" fill="#F5C400" />
      <rect x="13" y="6" width="10" height="36" fill="#8DC63F" />
      <rect x="26" y="6" width="10" height="36" fill="#006B3C" />
      <text
        x="37.5"
        y="14"
        fill="#006B3C"
        fontSize="7"
        fontWeight="700"
        fontFamily="inherit"
      >
        ®
      </text>
      <text
        x="48"
        y="37"
        fill="#1A1A1A"
        fontSize="32"
        fontWeight="700"
        letterSpacing="-0.6"
        fontFamily="inherit"
      >
        РСХБ
      </text>
    </svg>
  );
}
