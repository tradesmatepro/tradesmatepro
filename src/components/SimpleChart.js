import React from 'react';

const SimpleChart = ({ data, type = 'bar', title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value || item.amount || item.count || 0));
  const chartHeight = height - 40; // Leave space for labels

  if (type === 'bar') {
    return (
      <div className="w-full">
        {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
        <div className="flex items-end justify-between space-x-2" style={{ height: chartHeight }}>
          {data.map((item, index) => {
            const value = item.value || item.amount || item.count || 0;
            const barHeight = maxValue > 0 ? (value / maxValue) * (chartHeight - 20) : 0;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-1">
                    {typeof value === 'number' && value > 1000 
                      ? `$${(value / 1000).toFixed(1)}k`
                      : value
                    }
                  </div>
                  <div
                    className="w-full bg-primary-500 rounded-t"
                    style={{ height: `${barHeight}px`, minHeight: value > 0 ? '4px' : '0px' }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {item.label || item.month || item.week || item.name || `Item ${index + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || item.amount || item.count || 0), 0);
    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <div className="w-full">
        {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {data.map((item, index) => {
                const value = item.value || item.amount || item.count || 0;
                const percentage = total > 0 ? (value / total) * 100 : 0;
                const angle = (percentage / 100) * 360;
                
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle += angle;

                const startAngleRad = (startAngle * Math.PI) / 180;
                const endAngleRad = (endAngle * Math.PI) / 180;

                const x1 = centerX + radius * Math.cos(startAngleRad);
                const y1 = centerY + radius * Math.sin(startAngleRad);
                const x2 = centerX + radius * Math.cos(endAngleRad);
                const y2 = centerY + radius * Math.sin(endAngleRad);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                const colors = [
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
                ];

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={colors[index % colors.length]}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
          <div className="ml-6 space-y-2">
            {data.map((item, index) => {
              const value = item.value || item.amount || item.count || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              const colors = [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
              ];

              return (
                <div key={`legend-${item.label || item.name || index}`} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-gray-700">
                    {item.label || item.name} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-48 text-gray-500">
      Unsupported chart type
    </div>
  );
};

export default SimpleChart;
