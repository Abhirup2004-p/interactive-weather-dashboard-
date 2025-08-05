import { WeatherData, Point, TimeRange } from '@/types';

const API_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export const fetchWeatherData = async (
  point: Point,
  timeRange: TimeRange
): Promise<WeatherData[]> => {
  const startDate = timeRange.start.toISOString().split('T')[0];
  const endDate = timeRange.end.toISOString().split('T')[0];

  const url = `${API_BASE_URL}?latitude=${point.lat}&longitude=${point.lng}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.hourly || !data.hourly.time || !data.hourly.temperature_2m) {
      throw new Error('Invalid data format received from API');
    }

    return data.hourly.time.map((time: string, index: number) => ({
      time,
      temperature_2m: data.hourly.temperature_2m[index],
      latitude: point.lat,
      longitude: point.lng,
    }));
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return mock data for development
    return generateMockWeatherData(point, timeRange);
  }
};

export const fetchWeatherDataForPolygon = async (
  points: Point[],
  timeRange: TimeRange
): Promise<WeatherData[]> => {
  // Calculate centroid of the polygon
  const centroid = calculateCentroid(points);
  return fetchWeatherData(centroid, timeRange);
};

export const calculateCentroid = (points: Point[]): Point => {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sumLat = points.reduce((sum, point) => sum + point.lat, 0);
  const sumLng = points.reduce((sum, point) => sum + point.lng, 0);

  return {
    lat: sumLat / points.length,
    lng: sumLng / points.length,
  };
};

export const generateMockWeatherData = (
  point: Point,
  timeRange: TimeRange
): WeatherData[] => {
  const data: WeatherData[] = [];
  const currentTime = new Date(timeRange.start);
  
  while (currentTime <= timeRange.end) {
    // Generate realistic temperature data (between -10 and 35 degrees)
    const baseTemp = 15; // Base temperature
    const variation = Math.sin(currentTime.getTime() / (24 * 60 * 60 * 1000)) * 10; // Daily variation
    const randomVariation = (Math.random() - 0.5) * 5; // Random variation
    const temperature = baseTemp + variation + randomVariation;

    data.push({
      time: currentTime.toISOString(),
      temperature_2m: Math.round(temperature * 10) / 10,
      latitude: point.lat,
      longitude: point.lng,
    });

    currentTime.setHours(currentTime.getHours() + 1);
  }

  return data;
};

export const getAverageTemperature = (data: WeatherData[]): number => {
  if (data.length === 0) return 0;
  
  const sum = data.reduce((acc, item) => acc + item.temperature_2m, 0);
  return Math.round((sum / data.length) * 10) / 10;
};

export const getTemperatureForTimeRange = (
  data: WeatherData[],
  timeRange: TimeRange
): number => {
  const filteredData = data.filter(
    (item) => {
      const itemTime = new Date(item.time);
      return itemTime >= timeRange.start && itemTime <= timeRange.end;
    }
  );

  return getAverageTemperature(filteredData);
}; 