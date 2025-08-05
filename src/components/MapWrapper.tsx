'use client';

import dynamic from 'next/dynamic';

// Dynamically import the InteractiveMap component with no SSR
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '600px', 
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div>Loading map...</div>
    </div>
  )
});

const MapWrapper: React.FC = () => {
  return <InteractiveMap />;
};

export default MapWrapper; 