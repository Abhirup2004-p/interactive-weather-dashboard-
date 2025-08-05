export interface Point {
  lat: number;
  lng: number;
}

export interface Polygon {
  id: string;
  points: Point[];
  dataSource: string;
  color: string;
  name?: string;
  createdAt: Date;
}

export interface DataSource {
  id: string;
  name: string;
  field: string;
  colorRules: ColorRule[];
}

export interface ColorRule {
  id: string;
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
  label: string;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface WeatherData {
  time: string;
  temperature_2m: number;
  latitude: number;
  longitude: number;
}

export interface MapState {
  center: Point;
  zoom: number;
  isDrawing: boolean;
  polygons: Polygon[];
  selectedPolygon: string | null;
}

export interface TimelineState {
  currentTime: Date;
  timeRange: TimeRange;
  isRangeMode: boolean;
}

export interface DashboardState {
  map: MapState;
  timeline: TimelineState;
  dataSources: DataSource[];
  selectedDataSource: string | null;
} 