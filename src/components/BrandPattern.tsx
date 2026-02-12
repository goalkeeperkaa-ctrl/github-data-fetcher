const BrandPattern = ({ className = '', color = 'currentColor', opacity = 0.15 }: { className?: string; color?: string; opacity?: number }) => {
  // Recreates the Aidagis brand ornament pattern:
  // Each unit is two ellipses rotated ±45° forming a leaf/petal shape,
  // mirrored vertically, then tiled in a 4-column grid.
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Single petal unit: two overlapping rotated ellipses */}
        <g id="petal-top">
          <ellipse cx="24" cy="16" rx="10" ry="14" fill={color} transform="rotate(-45 24 16)" />
          <ellipse cx="52" cy="16" rx="10" ry="14" fill={color} transform="rotate(45 52 16)" />
        </g>
        <g id="petal-bottom">
          <ellipse cx="24" cy="38" rx="10" ry="14" fill={color} transform="rotate(45 24 38)" />
          <ellipse cx="52" cy="38" rx="10" ry="14" fill={color} transform="rotate(-45 52 38)" />
        </g>
        {/* Full ornament unit */}
        <g id="ornament-unit">
          <use href="#petal-top" />
          <use href="#petal-bottom" />
        </g>
        <pattern id="aidagis-pattern" x="0" y="0" width="76" height="76" patternUnits="userSpaceOnUse">
          <use href="#ornament-unit" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#aidagis-pattern)" />
    </svg>
  );
};

export default BrandPattern;
