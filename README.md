# Interactive Dashboard with Map and Timeline

A comprehensive React/Next.js TypeScript dashboard application that visualizes dynamic data over a map and timeline, with support for polygon creation and color-coded data display based on selected datasets.

## Features

### ✅ Core Requirements Implemented

1. **Timeline Slider**

   - Horizontal timeline slider with 30-day window (15 days before and after today)
   - Single draggable handle for specific hour selection
   - Dual-ended range slider for time window selection
   - Hourly resolution with visual time indicators
   - Drag and click interaction support

2. **Interactive Map**

   - Leaflet-based interactive map
   - Move and center reset functionality
   - Zoom locked at 2 sq. km resolution
   - Polygon persistence when moving the map

3. **Polygon Drawing Tools**

   - Button-activated polygon drawing mode
   - Minimum 3 points, maximum 12 points per polygon
   - Data source selection for each polygon
   - Polygon persistence and movement with map
   - View and delete polygon functionality

4. **Data Source Management**

   - Sidebar for data source and threshold control
   - Open-Meteo API integration (temperature_2m field)
   - User-defined color coding rules
   - Threshold-based coloring with operators (=, <, >, <=, >=)

5. **Color-Coded Polygons**

   - Automatic color updates based on data values
   - Real-time polygon coloring as timeline changes
   - Average value calculation for time ranges
   - Dynamic color rule application

6. **Open-Meteo API Integration**
   - Fetches temperature data using latitude/longitude
   - Handles time-series data for selected hours
   - Fallback to mock data for development

### 🎯 Bonus Features

- **State Persistence**: Local storage for polygons and data sources
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Ant Design components with clean styling
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Graceful fallbacks and user feedback

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **State Management**: Zustand with persistence
- **UI Library**: Ant Design
- **Mapping**: Leaflet with react-leaflet
- **Charts**: Recharts (ready for future use)
- **Sliders**: react-range
- **Styling**: CSS with Ant Design theme

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd dashboard-app
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Usage Guide

### Timeline Control

1. **Single Mode**: Drag the slider to select a specific hour
2. **Range Mode**: Click the "Range Mode" button and drag both ends to select a time window
3. The timeline shows 30 days centered around today with hourly resolution

### Map Interaction

1. **Draw Polygon**: Click "Draw Polygon" button, then click on the map to add points
2. **Complete Polygon**: Press Enter or add up to 12 points to complete
3. **Cancel Drawing**: Press Escape to cancel polygon drawing
4. **Reset Center**: Click "Reset Center" to return to Berlin

### Data Source Management

1. **Add Data Source**: Click "Add Data Source" in the sidebar
2. **Configure Rules**: Add color rules with operators and values
3. **Edit/Delete**: Use the edit and delete buttons for each data source

### Color Rules

- **Operators**: =, <, >, <=, >=
- **Example Rules**:
  - < 10°C → Red
  - 10-25°C → Blue
  - ≥ 25°C → Green

## API Integration

The application integrates with the Open-Meteo API:

```
https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lng}&start_date={start}&end_date={end}&hourly=temperature_2m
```

- **Field**: temperature_2m (2-meter temperature)
- **Resolution**: Hourly data
- **Fallback**: Mock data generation for development

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with Ant Design
│   ├── page.tsx        # Main page component
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── Dashboard.tsx   # Main dashboard layout
│   ├── TimelineSlider.tsx # Timeline control
│   ├── InteractiveMap.tsx # Map with polygon drawing
│   └── DataSourceSidebar.tsx # Data source management
├── store/              # State management
│   └── dashboardStore.ts # Zustand store
├── types/              # TypeScript definitions
│   └── index.ts        # Type interfaces
└── utils/              # Utility functions
    ├── api.ts          # API calls and data fetching
    └── colorUtils.ts   # Color calculation utilities
```

## State Management

The application uses Zustand for state management with the following stores:

- **Map State**: Center, zoom, drawing mode, polygons
- **Timeline State**: Current time, time range, range mode
- **Data Sources**: Available data sources and color rules
- **Persistence**: Local storage for polygons and data sources

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Additional data sources (humidity, precipitation, etc.)
- [ ] Polygon editing (move vertices, reshape)
- [ ] Advanced charting and analytics
- [ ] Export functionality
- [ ] User authentication
- [ ] Real-time data updates
- [ ] Advanced filtering and search
- [ ] Custom map styles and layers
