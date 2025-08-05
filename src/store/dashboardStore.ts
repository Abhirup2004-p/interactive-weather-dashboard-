import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardState, MapState, TimelineState, Polygon, Point, DataSource, TimeRange } from '@/types';

const defaultDataSources: DataSource[] = [
  {
    id: 'temperature',
    name: 'Temperature',
    field: 'temperature_2m',
    colorRules: [
      { id: '1', operator: '<', value: 10, color: '#ff4444', label: '< 10°C' },
      { id: '2', operator: '>=', value: 10, color: '#4444ff', label: '10-25°C' },
      { id: '3', operator: '>=', value: 25, color: '#44ff44', label: '≥ 25°C' },
    ],
  },
];

const defaultMapState: MapState = {
  center: { lat: 52.52, lng: 13.41 }, // Berlin
  zoom: 10,
  isDrawing: false,
  polygons: [],
  selectedPolygon: null,
};

const getDefaultTimeRange = (): TimeRange => {
  const now = new Date();
  const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
  const end = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
  return { start, end };
};

const defaultTimelineState: TimelineState = {
  currentTime: new Date(),
  timeRange: getDefaultTimeRange(),
  isRangeMode: false,
};

interface DashboardStore extends DashboardState {
  // Map actions
  setMapCenter: (center: Point) => void;
  setMapZoom: (zoom: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  addPolygon: (polygon: Omit<Polygon, 'id' | 'createdAt'>) => void;
  updatePolygon: (id: string, updates: Partial<Polygon>) => void;
  deletePolygon: (id: string) => void;
  setSelectedPolygon: (id: string | null) => void;
  
  // Timeline actions
  setCurrentTime: (time: Date) => void;
  setTimeRange: (range: TimeRange) => void;
  setIsRangeMode: (isRangeMode: boolean) => void;
  
  // Data source actions
  addDataSource: (dataSource: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  setSelectedDataSource: (id: string | null) => void;
  
  // Color rule actions
  addColorRule: (dataSourceId: string, rule: Omit<DataSource['colorRules'][0], 'id'>) => void;
  updateColorRule: (dataSourceId: string, ruleId: string, updates: Partial<DataSource['colorRules'][0]>) => void;
  deleteColorRule: (dataSourceId: string, ruleId: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      map: defaultMapState,
      timeline: defaultTimelineState,
      dataSources: defaultDataSources,
      selectedDataSource: null,

      // Map actions
      setMapCenter: (center) =>
        set((state) => ({
          map: { ...state.map, center },
        })),

      setMapZoom: (zoom) =>
        set((state) => ({
          map: { ...state.map, zoom },
        })),

      setIsDrawing: (isDrawing) =>
        set((state) => ({
          map: { ...state.map, isDrawing },
        })),

      addPolygon: (polygonData) => {
        const polygon: Polygon = {
          ...polygonData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          map: {
            ...state.map,
            polygons: [...state.map.polygons, polygon],
          },
        }));
      },

      updatePolygon: (id, updates) =>
        set((state) => ({
          map: {
            ...state.map,
            polygons: state.map.polygons.map((polygon) =>
              polygon.id === id ? { ...polygon, ...updates } : polygon
            ),
          },
        })),

      deletePolygon: (id) =>
        set((state) => ({
          map: {
            ...state.map,
            polygons: state.map.polygons.filter((polygon) => polygon.id !== id),
            selectedPolygon: state.map.selectedPolygon === id ? null : state.map.selectedPolygon,
          },
        })),

      setSelectedPolygon: (id) =>
        set((state) => ({
          map: { ...state.map, selectedPolygon: id },
        })),

      // Timeline actions
      setCurrentTime: (currentTime) =>
        set((state) => ({
          timeline: { ...state.timeline, currentTime },
        })),

      setTimeRange: (timeRange) =>
        set((state) => ({
          timeline: { ...state.timeline, timeRange },
        })),

      setIsRangeMode: (isRangeMode) =>
        set((state) => ({
          timeline: { ...state.timeline, isRangeMode },
        })),

      // Data source actions
      addDataSource: (dataSource) =>
        set((state) => ({
          dataSources: [...state.dataSources, dataSource],
        })),

      updateDataSource: (id, updates) =>
        set((state) => ({
          dataSources: state.dataSources.map((ds) =>
            ds.id === id ? { ...ds, ...updates } : ds
          ),
        })),

      deleteDataSource: (id) =>
        set((state) => ({
          dataSources: state.dataSources.filter((ds) => ds.id !== id),
          selectedDataSource: state.selectedDataSource === id ? null : state.selectedDataSource,
        })),

      setSelectedDataSource: (id) =>
        set((state) => ({
          selectedDataSource: id,
        })),

      // Color rule actions
      addColorRule: (dataSourceId, rule) =>
        set((state) => ({
          dataSources: state.dataSources.map((ds) =>
            ds.id === dataSourceId
              ? {
                  ...ds,
                  colorRules: [
                    ...ds.colorRules,
                    { ...rule, id: Date.now().toString() },
                  ],
                }
              : ds
          ),
        })),

      updateColorRule: (dataSourceId, ruleId, updates) =>
        set((state) => ({
          dataSources: state.dataSources.map((ds) =>
            ds.id === dataSourceId
              ? {
                  ...ds,
                  colorRules: ds.colorRules.map((rule) =>
                    rule.id === ruleId ? { ...rule, ...updates } : rule
                  ),
                }
              : ds
          ),
        })),

      deleteColorRule: (dataSourceId, ruleId) =>
        set((state) => ({
          dataSources: state.dataSources.map((ds) =>
            ds.id === dataSourceId
              ? {
                  ...ds,
                  colorRules: ds.colorRules.filter((rule) => rule.id !== ruleId),
                }
              : ds
          ),
        })),
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        map: { polygons: state.map.polygons },
        dataSources: state.dataSources,
      }),
    }
  )
); 