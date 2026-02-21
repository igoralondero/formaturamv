
import React from 'react';

interface LogoIconProps {
  className?: string;
  style?: React.CSSProperties;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className, style }) => (
  <div className={`inline-block ${className}`} style={style}>
    <img 
      src="https://lh3.googleusercontent.com/d/1_gcGQt2Zv8HTScl9xd9zd5YHlMx6K4lQ" 
      alt="Logo Maria Valentina"
      className="w-full h-full object-contain"
      referrerPolicy="no-referrer"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://img.icons8.com/ios-filled/100/ffffff/graduation-cap.png";
      }}
    />
  </div>
);

export default LogoIcon;
