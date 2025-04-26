import React, { useRef, useState, useEffect } from 'react';

export const Slider = ({ 
  min = 0,
  max = 100,
  step = 1,
  value = [min, max],
  onChange,
  range = false,
  tooltip = null,
  disabled = false
}) => {
  const [dragging, setDragging] = useState(null);
  const [localValue, setLocalValue] = useState(value);
  const trackRef = useRef(null);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (dragging !== null) {
        setDragging(null);
        // Call onChange with final value
        onChange(localValue);
      }
    };
    
    const handleMouseMove = (e) => {
      if (dragging === null || !trackRef.current) return;
      
      const track = trackRef.current;
      const rect = track.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = Math.min(Math.max(0, offsetX / rect.width), 1);
      const newValue = Math.round((percentage * (max - min) + min) / step) * step;
      
      setLocalValue(prev => {
        const newValues = [...prev];
        newValues[dragging] = newValue;
        
        // Ensure min handle doesn't go past max handle and vice versa
        if (dragging === 0 && newValues[0] > newValues[1]) {
          newValues[0] = newValues[1];
        } else if (dragging === 1 && newValues[1] < newValues[0]) {
          newValues[1] = newValues[0];
        }
        
        return newValues;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, min, max, step, onChange, localValue]);
  
  const getPercentage = (value) => {
    return ((value - min) / (max - min)) * 100;
  };
  
  const handleMouseDown = (index) => {
    if (disabled) return;
    setDragging(index);
  };
  
  const renderTooltip = (value) => {
    if (!tooltip) return null;
    
    const content = tooltip.formatter ? tooltip.formatter(value) : value;
    
    return (
      <div 
        className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
      >
        {content}
      </div>
    );
  };
  
  return (
    <div className="relative w-full h-10 flex items-center touch-none">
      <div 
        ref={trackRef}
        className={`w-full h-2 rounded-full bg-gray-200 relative ${disabled ? 'opacity-50' : ''}`}
      >
        {/* Track Fill */}
        <div 
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${getPercentage(localValue[0])}%`,
            right: `${100 - getPercentage(localValue[1])}%`
          }}
        />
        
        {/* Min Handle */}
        <div 
          className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 transform -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} 
            ${dragging === 0 ? 'cursor-grabbing z-10' : 'z-5'}`}
          style={{ left: `${getPercentage(localValue[0])}%` }}
          onMouseDown={() => handleMouseDown(0)}
        >
          {(dragging === 0 || tooltip?.always) && renderTooltip(localValue[0])}
        </div>
        
        {/* Max Handle */}
        <div 
          className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 transform -translate-x-1/2 -translate-y-1/2 top-1/2 
            ${disabled ? 'cursor-not-allowed' : 'cursor-grab'} 
            ${dragging === 1 ? 'cursor-grabbing z-10' : 'z-5'}`}
          style={{ left: `${getPercentage(localValue[1])}%` }}
          onMouseDown={() => handleMouseDown(1)}
        >
          {(dragging === 1 || tooltip?.always) && renderTooltip(localValue[1])}
        </div>
      </div>
    </div>
  );
};

export default Slider; 