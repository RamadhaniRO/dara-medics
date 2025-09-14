import React from 'react';
import { IconType } from 'react-icons';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Import new component system
import {
  Card,
  Text,
  Flex,
  Box
} from '../atoms';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: IconType;
  color: string;
  subtitle?: string;
  compact?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  subtitle,
  compact = false
}) => {
  return (
    <Card 
      elevation="sm" 
      padding={compact ? "3" : "4"} 
      hover={true}
      style={{ 
        cursor: 'pointer',
        minHeight: compact ? '80px' : '90px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginBottom: '0',
        backgroundColor: 'white',
        border: '1px solid #f1f5f9'
      }}
    >
      <Flex justify="space-between" align="start" style={{ flex: 1 }}>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text 
            size="sm" 
            color="#64748b" 
            weight="medium"
            style={{ 
              marginBottom: compact ? '0.25rem' : '0.375rem',
              fontSize: compact ? '0.65rem' : '0.7rem',
              lineHeight: '1.2'
            }}
          >
            {title}
          </Text>
          <Text 
            size="xl" 
            weight="bold" 
            style={{ 
              marginBottom: compact ? '0.25rem' : '0.375rem',
              fontSize: compact ? '1.3rem' : '1.5rem',
              lineHeight: '1.1',
              color: '#0f172a'
            }}
          >
            {value}
          </Text>
          {subtitle && (
            <Text 
              size="xs" 
              color="#64748b" 
              margin="0"
              style={{ 
                fontSize: '0.6rem',
                lineHeight: '1.2'
              }}
            >
              {subtitle}
            </Text>
          )}
          {change && trend && (
            <Flex align="center" gap="2" style={{ marginTop: compact ? '0.25rem' : '0.375rem' }}>
              <Box
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: trend === 'up' ? '#dcfce7' : '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {trend === 'up' ? (
                  <FiTrendingUp style={{ color: '#16a34a', fontSize: '8px' }} />
                ) : (
                  <FiTrendingDown style={{ color: '#dc2626', fontSize: '8px' }} />
                )}
              </Box>
              <Text 
                size="sm" 
                weight="medium" 
                color={trend === 'up' ? '#16a34a' : '#dc2626'}
                margin="0"
                style={{
                  fontSize: compact ? '0.65rem' : '0.75rem',
                  lineHeight: '1.2'
                }}
              >
                {change}
              </Text>
            </Flex>
          )}
        </Box>
        
        <Box
          style={{
            width: compact ? '36px' : '40px',
            height: compact ? '36px' : '40px',
            borderRadius: '10px',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            flexShrink: 0,
            marginLeft: '0.5rem'
          }}
        >
          <Icon size={compact ? 18 : 20} />
        </Box>
      </Flex>
    </Card>
  );
};

export default MetricCard;