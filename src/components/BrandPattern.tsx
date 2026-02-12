const BrandPattern = ({ className = '' }: { className?: string }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 171 109" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M8.16309 28.1102C11.4879 21.4605 21.4021 8.88651 34.4597 11.7882C50.7817 15.4153 59.8495 28.1102 84.3326 28.1102C111.536 28.1102 113.835 8.16124 129.672 8.16113C143.273 8.16104 156.573 20.8561 162.316 25.39" 
        stroke="hsl(var(--brand-gold))" 
        strokeWidth="16.322" 
        strokeLinecap="round" 
      />
      <path 
        d="M8.16309 64.3817C11.4879 57.732 21.4021 45.158 34.4597 48.0597C50.7817 51.6868 59.8495 64.3817 84.3326 64.3817C111.536 64.3817 113.835 44.4327 129.672 44.4326C143.273 44.4325 156.573 57.1276 162.316 61.6615" 
        stroke="hsl(var(--brand-gold))" 
        strokeWidth="16.322" 
        strokeLinecap="round" 
      />
      <path 
        d="M8.16309 100.652C11.4879 94.0025 21.4021 81.4285 34.4597 84.3302C50.7817 87.9573 59.8495 100.652 84.3326 100.652C111.536 100.652 113.835 80.7032 129.672 80.7031C143.273 80.703 156.573 93.3981 162.316 97.932" 
        stroke="hsl(var(--brand-gold))" 
        strokeWidth="16.322" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default BrandPattern;
