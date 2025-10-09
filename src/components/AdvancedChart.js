import React from 'react';

const AdvancedChart = ({ 
  type = 'bar', 
  data = [], 
  title = '', 
  height = '300px',
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">📊</div>
          <p className="text-gray-500 text-sm">No data available</p>
        </div>
      </div>
    );
  }

  // Validate data values
  const validValues = data.map(item => Number(item.value || 0)).filter(val => !isNaN(val));
  const maxValue = validValues.length > 0 ? Math.max(...validValues) : 0;
  const minValue = validValues.length > 0 ? Math.min(...validValues) : 0;
  const range = maxValue - minValue;

  if (type === 'bar') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div className="space-y-4" style={{ height }}>
          {data.map((item, index) => {
            const value = Number(item.value || 0);
            const percentage = range > 0 && !isNaN(value) ? ((value - minValue) / range) * 100 : 0;
            const color = colors[index % colors.length];

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-sm text-gray-600 text-right">
                  {item.label}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                    style={{
                      width: `${Math.max(isNaN(percentage) ? 0 : percentage, 5)}%`,
                      backgroundColor: color
                    }}
                  >
                    {isNaN(value) ? 0 : value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    // Validate data and filter out invalid values
    const validData = data.filter(item => !isNaN(item.value) && item.value > 0);
    if (validData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500 text-sm">No valid data for pie chart</p>
          </div>
        </div>
      );
    }

    const total = validData.reduce((sum, item) => sum + Number(item.value || 0), 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-400 mb-2">📊</div>
            <p className="text-gray-500 text-sm">No data to display</p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="relative">
            <svg width="200" height="200" className="transform -rotate-90">
              {validData.map((item, index) => {
                const value = Number(item.value || 0);
                const percentage = (value / total) * 100;
                const angle = (value / total) * 360;
                const color = colors[index % colors.length];

                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle += angle;

                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;

                const largeArcFlag = angle > 180 ? 1 : 0;
                const x1 = 100 + 80 * Math.cos(startAngleRad);
                const y1 = 100 + 80 * Math.sin(startAngleRad);
                const x2 = 100 + 80 * Math.cos(endAngleRad);
                const y2 = 100 + 80 * Math.sin(endAngleRad);

                // Validate coordinates before creating path
                if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
                  return null;
                }

                const pathData = [
                  `M 100 100`,
                  `L ${x1} ${y1}`,
                  `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity"
                  />
                );
              })}
            </svg>
            
            {/* Legend */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4">
              <div className="flex flex-wrap justify-center gap-2">
                {validData.map((item, index) => {
                  const value = Number(item.value || 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return (
                    <div key={index} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-xs text-gray-600">
                        {item.label} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const svgWidth = 400;
    const svgHeight = 200;
    const padding = 40;
    const chartWidth = svgWidth - 2 * padding;
    const chartHeight = svgHeight - 2 * padding;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div style={{ height }}>
          <svg width={svgWidth} height={svgHeight} className="w-full">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <line
                key={index}
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={svgWidth - padding}
                y2={padding + chartHeight * ratio}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={colors[0]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((item.value - minValue) / range) * chartHeight;

              return (
                <circle
                  key={`data-point-${item.label || item.name || index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={colors[0]}
                  className="hover:r-6 transition-all"
                />
              );
            })}
            
            {/* X-axis labels */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * chartWidth;
              return (
                <text
                  key={`x-label-${item.label || item.name || index}`}
                  x={x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    );
  }

  return null;
};

export default AdvancedChart;
