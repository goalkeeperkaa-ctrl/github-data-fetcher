const BrandChart = ({ className = '' }: { className?: string }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 182 105" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M8 96.6758L45.3282 47.8038C50.5333 40.9891 60.5862 40.4128 66.5359 46.5879L73.3551 53.6655C78.2062 58.7004 86.462 57.9912 90.3834 52.2029L116.163 14.15C122.41 4.92976 136.399 6.34061 140.679 16.6224L174 96.6758" 
        stroke="hsl(var(--accent))" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />
    </svg>
  );
};

export default BrandChart;
