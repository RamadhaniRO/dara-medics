// Main component exports
export * from './atoms';
export * from './molecules';
export * from './organisms';

// Dashboard components
export { default as MetricCard } from './dashboard/MetricCard';
export { default as SimpleMetricCard } from './dashboard/SimpleMetricCard';
export { default as AgentPerformance } from './dashboard/AgentPerformance';
export { default as RecentOrders } from './dashboard/RecentOrders';
export { default as SystemHealth } from './dashboard/SystemHealth';
export { default as ChartPlaceholder } from './dashboard/ChartPlaceholder';

// Legacy components (to be refactored)
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as ProtectedRoute } from './auth/ProtectedRoute';
// export { default as AuthLeftPanel } from './auth/AuthLeftPanel';
