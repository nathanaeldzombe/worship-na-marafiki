// Real flag images that render on every device (including Windows,
// which doesn't display flag emoji). Uses flagcdn.com, a free flag CDN.
// Falls back gracefully if an image fails to load.

export default function Flag({ cc, size = 40, rounded = true, style = {} }) {
  if (!cc) return null;
  // w80 gives a crisp image at typical display sizes.
  const src = `https://flagcdn.com/w80/${cc}.png`;
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={Math.round(size * 0.66)}
      loading="lazy"
      style={{
        width: size,
        height: Math.round(size * 0.66),
        objectFit: 'cover',
        borderRadius: rounded ? 4 : 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        display: 'inline-block',
        ...style,
      }}
    />
  );
}
