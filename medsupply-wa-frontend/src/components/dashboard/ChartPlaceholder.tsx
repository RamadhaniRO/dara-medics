import React from 'react';
import { IconType } from 'react-icons';

// Import new component system
import {
  Box,
  Text,
  Flex
} from '../atoms';

interface ChartPlaceholderProps {
  title: string;
  description: string;
  icon: IconType;
  height?: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  title,
  description,
  icon: Icon,
  height = '300px'
}) => {
  return (
    <Box 
      style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}
    >
      <Flex direction="column" gap="3" align="center">
        <Box
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon size={32} style={{ color: '#9ca3af' }} />
        </Box>
        <Text color="#6b7280" weight="medium">
          {title}
        </Text>
        <Text size="sm" color="#9ca3af">
          {description}
        </Text>
      </Flex>
    </Box>
  );
};

export default ChartPlaceholder;
