const SIZES = {
  xs: { w: 16, h: 12 },
  sm: { w: 24, h: 18 },
  md: { w: 32, h: 24 },
};

export default function CountryFlag({ code, name, size = 'sm', className = '' }) {
  if (!code) return null;
  const dims = SIZES[size] ?? SIZES.sm;
  return (
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={name ? `${name} flag` : `${code} flag`}
      width={dims.w}
      height={dims.h}
      loading="lazy"
      decoding="async"
      className={`inline-block rounded-sm ring-1 ring-white/10 shadow-sm object-cover shrink-0 ${className}`}
      style={{ width: dims.w, height: dims.h }}
    />
  );
}
