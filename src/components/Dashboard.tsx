'use client';

import React, { useEffect } from 'react';
import { Layout } from 'antd';
import TimelineSlider from './TimelineSlider';
import MapWrapper from './MapWrapper';
import DataSourceSidebar from './DataSourceSidebar';
import { useDashboardStore } from '@/store/dashboardStore';
import { fetchWeatherDataForPolygon, getTemperatureForTimeRange } from '@/utils/api';
import { getColorForValue } from '@/utils/colorUtils';

const { Content } = Layout;

const Dashboard: React.FC = () => {
  const {
    map: mapState,
    timeline,
    dataSources,
    updatePolygon,
  } = useDashboardStore();

  // Update polygon colors based on timeline and data
  useEffect(() => {
    const updatePolygonColors = async () => {
      for (const polygon of mapState.polygons) {
        const dataSource = dataSources.find((ds: any) => ds.id === polygon.dataSource);
        if (!dataSource) continue;

        try {
          const weatherData = await fetchWeatherDataForPolygon(
            polygon.points,
            timeline.isRangeMode ? timeline.timeRange : { start: timeline.currentTime, end: timeline.currentTime }
          );

          const temperature = getTemperatureForTimeRange(weatherData, timeline.isRangeMode ? timeline.timeRange : { start: timeline.currentTime, end: timeline.currentTime });
          const color = getColorForValue(temperature, dataSource);

          updatePolygon(polygon.id, { color });
        } catch (error) {
          console.error('Error updating polygon color:', error);
        }
      }
    };

    updatePolygonColors();
  }, [mapState.polygons, timeline, dataSources, updatePolygon]);

  return (
    <Layout style={{ height: '100vh' }}>
      <TimelineSlider />
      <Layout>
        <DataSourceSidebar />
        <Content style={{ padding: '16px' }}>
          <MapWrapper />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard; 