'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, Space, Modal, Select, message } from 'antd';
import { useDashboardStore } from '@/store/dashboardStore';
import { Point } from '@/types';

const { Option } = Select;

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Polygon = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polygon),
  { ssr: false }
);

// Import Leaflet only on client side
let L: any = null;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  
  // Fix for Leaflet marker icons in Next.js
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface DrawingLayerProps {
  isDrawing: boolean;
  onPolygonComplete: (points: Point[]) => void;
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({ isDrawing, onPolygonComplete }) => {
  const drawingRef = useRef<any>(null);
  const pointsRef = useRef<Point[]>([]);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!L || typeof window === 'undefined') return;

    const map = (window as any).__mapRef;
    if (!map) return;

    if (!isDrawing) {
      // Clear any existing drawing
      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
        drawingRef.current = null;
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
      pointsRef.current = [];
      return;
    }

    const handleMapClick = (e: any) => {
      if (!isDrawing) return;

      const point: Point = { lat: e.latlng.lat, lng: e.latlng.lng };
      pointsRef.current.push(point);

      // Add marker
      const marker = L.marker(e.latlng).addTo(map);
      markersRef.current.push(marker);

      // Update polygon
      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
      }

      if (pointsRef.current.length >= 3) {
        drawingRef.current = L.polygon(pointsRef.current.map((p: Point) => [p.lat, p.lng]), {
          color: 'blue',
          fillColor: '#3388ff',
          fillOpacity: 0.3,
          weight: 2,
        }).addTo(map);
      }

      // Check if we have enough points to complete
      if (pointsRef.current.length >= 12) {
        completePolygon();
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isDrawing && pointsRef.current.length >= 3) {
        completePolygon();
      } else if (e.key === 'Escape' && isDrawing) {
        cancelDrawing();
      }
    };

    const completePolygon = () => {
      if (pointsRef.current.length >= 3) {
        onPolygonComplete([...pointsRef.current]);
      }
      cancelDrawing();
    };

    const cancelDrawing = () => {
      if (drawingRef.current) {
        map.removeLayer(drawingRef.current);
        drawingRef.current = null;
      }
      markersRef.current.forEach(marker => map.removeLayer(marker));
      markersRef.current = [];
      pointsRef.current = [];
    };

    map.on('click', handleMapClick);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      map.off('click', handleMapClick);
      document.removeEventListener('keydown', handleKeyPress);
      cancelDrawing();
    };
  }, [isDrawing, onPolygonComplete]);

  return null;
};

interface MapControlsProps {
  onToggleDrawing: () => void;
  onResetCenter: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ onToggleDrawing, onResetCenter }) => {
  return (
    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
      <Space direction="vertical">
        <Button type="primary" onClick={onToggleDrawing}>
          Draw Polygon
        </Button>
        <Button onClick={onResetCenter}>
          Reset Center
        </Button>
      </Space>
    </div>
  );
};

const InteractiveMap: React.FC = () => {
  const {
    map: mapState,
    dataSources,
    selectedDataSource,
    setMapCenter,
    setIsDrawing,
    addPolygon,
    deletePolygon,
    setSelectedDataSource,
  } = useDashboardStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingPolygon, setPendingPolygon] = useState<Point[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePolygonComplete = (points: Point[]) => {
    setPendingPolygon(points);
    setIsModalVisible(true);
  };

  const handlePolygonConfirm = () => {
    if (selectedDataSource && pendingPolygon.length >= 3) {
      addPolygon({
        points: pendingPolygon,
        dataSource: selectedDataSource,
        color: '#3388ff', // Default color, will be updated based on data
      });
      setIsModalVisible(false);
      setPendingPolygon([]);
      setIsDrawing(false);
      message.success('Polygon created successfully!');
    } else {
      message.error('Please select a data source and ensure polygon has at least 3 points');
    }
  };

  const handlePolygonCancel = () => {
    setIsModalVisible(false);
    setPendingPolygon([]);
    setIsDrawing(false);
  };

  const handleToggleDrawing = () => {
    setIsDrawing(!mapState.isDrawing);
  };

  const handleResetCenter = () => {
    setMapCenter({ lat: 52.52, lng: 13.41 }); // Berlin
  };

  const handlePolygonClick = (polygonId: string) => {
    // Handle polygon selection if needed
    console.log('Polygon clicked:', polygonId);
  };

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div style={{ 
        position: 'relative', 
        height: '600px', 
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '600px', width: '100%' }}>
      <MapContainer
        center={[mapState.center.lat, mapState.center.lng]}
        zoom={mapState.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        ref={(map) => {
          if (map) {
            // Store map reference for drawing layer
            (window as any).__mapRef = map;
          }
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <DrawingLayer
          isDrawing={mapState.isDrawing}
          onPolygonComplete={handlePolygonComplete}
        />

        {mapState.polygons.map((polygon) => (
          <Polygon
            key={polygon.id}
            positions={polygon.points.map(p => [p.lat, p.lng])}
            pathOptions={{
              color: polygon.color,
              fillColor: polygon.color,
              fillOpacity: 0.3,
              weight: 2,
            }}
            eventHandlers={{
              click: () => handlePolygonClick(polygon.id),
            }}
          />
        ))}
      </MapContainer>

      <MapControls
        onToggleDrawing={handleToggleDrawing}
        onResetCenter={handleResetCenter}
      />

      <Modal
        title="Select Data Source"
        open={isModalVisible}
        onOk={handlePolygonConfirm}
        onCancel={handlePolygonCancel}
        okText="Create Polygon"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: '16px' }}>
          <p>Polygon created with {pendingPolygon.length} points</p>
          <p>Please select a data source for this polygon:</p>
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="Select a data source"
          value={selectedDataSource}
          onChange={setSelectedDataSource}
        >
          {dataSources.map((ds) => (
            <Option key={ds.id} value={ds.id}>
              {ds.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default InteractiveMap; 