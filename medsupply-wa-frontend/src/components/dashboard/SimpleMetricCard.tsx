import React from 'react';
import { IconType } from 'react-icons';

// Import new component system
import {
  Card,
  Text,
  Flex,
  Box
} from '../atoms';

interface SimpleMetricCardProps {
  title: string;
  value: string;
  icon: IconType;
  color: string;
  subtitle?: string;
  compact?: boolean;
}

const SimpleMetricCard: React.FC<SimpleMetricCardProps> = ({
  title,
  value,
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
        minHeight: compact ? '75px' : '85px',
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
              marginBottom: compact ? '0.2rem' : '0.25rem',
              fontSize: compact ? '0.65rem' : '0.7rem',
              lineHeight: '1.2'
            }}
          >
            {title}
          </Text>
          <Text 
            size="xl" 
            weight="bold" 
            margin="0"
            style={{ 
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
                lineHeight: '1.2',
                marginTop: compact ? '0.1rem' : '0.15rem'
              }}
            >
              {subtitle}
            </Text>
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

export default SimpleMetricCard;
