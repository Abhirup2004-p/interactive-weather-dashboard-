'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Range } from 'react-range';
import { Button, Space, Typography } from 'antd';
import { useDashboardStore } from '@/store/dashboardStore';
import { TimeRange } from '@/types';

const { Text } = Typography;

const TimelineSlider: React.FC = () => {
  const {
    timeline,
    setCurrentTime,
    setTimeRange,
    setIsRangeMode,
  } = useDashboardStore();

  const [values, setValues] = useState<number[]>([0]);
  const [timeSteps, setTimeSteps] = useState<Date[]>([]);

  // Generate time steps for the slider (hourly resolution)
  useEffect(() => {
    const steps: Date[] = [];
    const current = new Date(timeline.timeRange.start);
    
    while (current <= timeline.timeRange.end) {
      steps.push(new Date(current));
      current.setHours(current.getHours() + 1);
    }
    
    setTimeSteps(steps);
  }, [timeline.timeRange]);

  // Update slider values when timeline changes
  useEffect(() => {
    if (timeline.isRangeMode) {
      const startIndex = timeSteps.findIndex(
        (step) => step >= timeline.timeRange.start
      );
      const endIndex = timeSteps.findIndex(
        (step) => step >= timeline.timeRange.end
      );
      setValues([startIndex >= 0 ? startIndex : 0, endIndex >= 0 ? endIndex : timeSteps.length - 1]);
    } else {
      const currentIndex = timeSteps.findIndex(
        (step) => step >= timeline.currentTime
      );
      setValues([currentIndex >= 0 ? currentIndex : 0]);
    }
  }, [timeline, timeSteps]);

  const handleRangeChange = useCallback((newValues: number[]) => {
    setValues(newValues);
    
    if (timeline.isRangeMode) {
      const [startIndex, endIndex] = newValues;
      const newTimeRange: TimeRange = {
        start: timeSteps[startIndex] || timeline.timeRange.start,
        end: timeSteps[endIndex] || timeline.timeRange.end,
      };
      setTimeRange(newTimeRange);
    } else {
      const currentIndex = newValues[0];
      const newCurrentTime = timeSteps[currentIndex] || timeline.currentTime;
      setCurrentTime(newCurrentTime);
    }
  }, [timeline.isRangeMode, timeSteps, setTimeRange, setCurrentTime, timeline.timeRange.start, timeline.timeRange.end, timeline.currentTime]);

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleMode = () => {
    setIsRangeMode(!timeline.isRangeMode);
  };

  const getCurrentTimeDisplay = (): string => {
    if (timeline.isRangeMode) {
      return `${formatTime(timeline.timeRange.start)} - ${formatTime(timeline.timeRange.end)}`;
    }
    return formatTime(timeline.currentTime);
  };

  if (timeSteps.length === 0) {
    return <div>Loading timeline...</div>;
  }

  return (
    <div className="timeline-slider" style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Timeline Control</Text>
          <Space>
            <Button
              type={timeline.isRangeMode ? 'default' : 'primary'}
              size="small"
              onClick={toggleMode}
            >
              {timeline.isRangeMode ? 'Range Mode' : 'Single Mode'}
            </Button>
            <Text type="secondary">
              {timeline.isRangeMode ? 'Select time range' : 'Select single time'}
            </Text>
          </Space>
        </div>

        <div style={{ padding: '0 20px' }}>
          <Range
            step={1}
            min={0}
            max={timeSteps.length - 1}
            values={values}
            onChange={handleRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  backgroundColor: '#ddd',
                  borderRadius: '3px',
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '20px',
                  width: '20px',
                  backgroundColor: '#1890ff',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            )}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text strong>{getCurrentTimeDisplay()}</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
          <span>{formatTime(timeSteps[0])}</span>
          <span>{formatTime(timeSteps[timeSteps.length - 1])}</span>
        </div>
      </Space>
    </div>
  );
};

export default TimelineSlider; 