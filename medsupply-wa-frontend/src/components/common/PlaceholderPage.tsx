import React from 'react';
import styled from 'styled-components';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin: ${({ theme }) => theme.spacing.lg};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  text-align: center;
  max-width: 500px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes['3xl']};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textDark};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.base};
  color: ${({ theme }) => theme.colors.textMedium};
  line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
`;

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <Container>
      <Card>
        <Title>{title}</Title>
        <Description>
          {description || `${title} page will be implemented here.`}
        </Description>
      </Card>
    </Container>
  );
};

export default PlaceholderPage;
