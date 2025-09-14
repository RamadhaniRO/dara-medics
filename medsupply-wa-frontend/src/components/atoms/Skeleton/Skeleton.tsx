import React from 'react';
import styled, { keyframes } from 'styled-components';

// Skeleton animation
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const SkeletonBase = styled.div<{ width?: string; height?: string; borderRadius?: string }>`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '1rem'};
  border-radius: ${({ borderRadius }) => borderRadius || '4px'};
`;

// Basic skeleton components
export const SkeletonBox = styled(SkeletonBase)``;

export const SkeletonText = styled(SkeletonBase)<{ lines?: number }>`
  margin-bottom: ${({ lines }) => lines && lines > 1 ? '0.5rem' : '0'};
`;

export const SkeletonCircle = styled(SkeletonBase)`
  border-radius: 50%;
  width: ${({ width }) => width || '2rem'};
  height: ${({ height }) => height || '2rem'};
`;

export const SkeletonCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Specific skeleton components for different content types
export const SkeletonMetricCard: React.FC = () => (
  <SkeletonCard>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
      <SkeletonCircle width="2.5rem" height="2.5rem" />
      <div style={{ flex: 1 }}>
        <SkeletonText height="0.75rem" width="60%" style={{ marginBottom: '0.25rem' }} />
        <SkeletonText height="1.25rem" width="40%" />
      </div>
    </div>
    <SkeletonText height="0.625rem" width="80%" />
  </SkeletonCard>
);

export const SkeletonTableRow: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
    <SkeletonCircle width="2rem" height="2rem" style={{ marginRight: '0.75rem' }} />
    <div style={{ flex: 1 }}>
      <SkeletonText height="0.875rem" width="70%" style={{ marginBottom: '0.25rem' }} />
      <SkeletonText height="0.625rem" width="50%" />
    </div>
    <SkeletonText height="0.875rem" width="4rem" style={{ marginRight: '1rem' }} />
    <SkeletonText height="0.875rem" width="3rem" />
  </div>
);

export const SkeletonOrderCard: React.FC = () => (
  <div style={{ 
    padding: '0.75rem', 
    backgroundColor: '#f8fafc', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0',
    marginBottom: '0.75rem'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
      <SkeletonText height="0.875rem" width="8rem" />
      <SkeletonText height="0.75rem" width="4rem" />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <SkeletonText height="0.75rem" width="6rem" style={{ marginBottom: '0.25rem' }} />
        <SkeletonText height="0.625rem" width="4rem" />
      </div>
      <SkeletonText height="0.875rem" width="3rem" />
    </div>
  </div>
);

export const SkeletonChart: React.FC = () => (
  <SkeletonCard>
    <div style={{ marginBottom: '1rem' }}>
      <SkeletonText height="1rem" width="40%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonText height="0.75rem" width="60%" />
    </div>
    <div style={{ height: '200px', display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonBox 
          key={i} 
          height={`${Math.random() * 100 + 50}px`} 
          width="100%" 
          style={{ borderRadius: '4px 4px 0 0' }}
        />
      ))}
    </div>
  </SkeletonCard>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonTableRow key={i} />
    ))}
  </div>
);

export const SkeletonGrid: React.FC<{ columns?: number; items?: number }> = ({ 
  columns = 4, 
  items = 8 
}) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: `repeat(${columns}, 1fr)`, 
    gap: '1rem' 
  }}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonMetricCard key={i} />
    ))}
  </div>
);

// Loading states for specific pages
export const DashboardSkeleton: React.FC = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonText height="1.5rem" width="30%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonText height="0.875rem" width="50%" />
    </div>
    
    {/* Metrics Grid */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonGrid columns={4} items={4} />
    </div>
    
    {/* Charts Row */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
      <SkeletonChart />
      <SkeletonCard>
        <SkeletonText height="1rem" width="40%" style={{ marginBottom: '1rem' }} />
        <SkeletonList items={4} />
      </SkeletonCard>
    </div>
    
    {/* Recent Orders */}
    <SkeletonCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <SkeletonText height="1.25rem" width="25%" />
        <SkeletonText height="0.875rem" width="8rem" />
      </div>
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonOrderCard key={i} />
        ))}
      </div>
    </SkeletonCard>
  </div>
);

export const AnalyticsSkeleton: React.FC = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonText height="1.5rem" width="25%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonText height="0.875rem" width="40%" />
    </div>
    
    {/* Metrics */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonGrid columns={4} items={4} />
    </div>
    
    {/* Charts */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
      <SkeletonChart />
      <SkeletonChart />
    </div>
    
    {/* Data Table */}
    <SkeletonCard>
      <div style={{ marginBottom: '1rem' }}>
        <SkeletonText height="1.25rem" width="30%" />
      </div>
      <SkeletonList items={6} />
    </SkeletonCard>
  </div>
);

export const PaymentsSkeleton: React.FC = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonText height="1.5rem" width="30%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonText height="0.875rem" width="45%" />
    </div>
    
    {/* Payment Methods */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonGrid columns={4} items={4} />
    </div>
    
    {/* Filters */}
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <SkeletonText height="2.5rem" width="8rem" />
      <SkeletonText height="2.5rem" width="8rem" />
      <SkeletonText height="2.5rem" width="8rem" />
    </div>
    
    {/* Payments Table */}
    <SkeletonCard>
      <SkeletonList items={8} />
    </SkeletonCard>
  </div>
);

export const OrdersSkeleton: React.FC = () => (
  <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
    {/* Header */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonText height="1.5rem" width="25%" style={{ marginBottom: '0.5rem' }} />
      <SkeletonText height="0.875rem" width="35%" />
    </div>
    
    {/* Stats */}
    <div style={{ marginBottom: '2rem' }}>
      <SkeletonGrid columns={4} items={4} />
    </div>
    
    {/* Filters */}
    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
      <SkeletonText height="2.5rem" width="8rem" />
      <SkeletonText height="2.5rem" width="8rem" />
      <SkeletonText height="2.5rem" width="8rem" />
    </div>
    
    {/* Orders Table */}
    <SkeletonCard>
      <SkeletonList items={10} />
    </SkeletonCard>
  </div>
);

// Export all skeleton components
export default {
  SkeletonBox,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonMetricCard,
  SkeletonTableRow,
  SkeletonOrderCard,
  SkeletonChart,
  SkeletonList,
  SkeletonGrid,
  DashboardSkeleton,
  AnalyticsSkeleton,
  PaymentsSkeleton,
  OrdersSkeleton,
};
