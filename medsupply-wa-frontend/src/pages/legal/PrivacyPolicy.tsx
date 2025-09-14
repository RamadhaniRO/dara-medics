import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Import new component system
import {
  Container,
  Card,
  Heading,
  Text,
  Button,
  Box,
  Flex
} from '../../components';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#faf9f6',
      padding: '2rem'
    }}>
      <Container maxWidth="800px" center>
        <Card elevation="lg" padding="3rem">
          <Flex direction="column" gap="4">
            <Box>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '2rem',
                  color: '#3182ce',
                  textDecoration: 'none'
                }}
              >
                <FiArrowLeft size={20} />
                Back
              </Button>
            </Box>
            
            <Heading as="h1" size="3xl" color="#1a202c" margin="0">
              Privacy Policy
            </Heading>
            
            <Text color="#718096" size="lg" style={{ marginTop: '0.5rem' }}>
              Last updated: December 2023
            </Text>

            <Box style={{ marginTop: '2rem' }}>
              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                1. Information We Collect
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, phone number, pharmacy information, and other contact details.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                2. How We Use Your Information
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and communicate with you about products, services, and events.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                3. Information Sharing
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy or as required by law.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                4. Data Security
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                5. Cookies and Tracking
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We use cookies and similar tracking technologies to enhance your experience on our website, analyze usage patterns, and provide personalized content and advertisements.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                6. Your Rights
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications and request that we stop processing your data for specific purposes.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                7. Children's Privacy
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                8. Changes to This Policy
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                9. Contact Us
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                If you have any questions about this privacy policy, please contact us at privacy@daramedics.com or through our support channels.
              </Text>
            </Box>

            <Box style={{ marginTop: '3rem', textAlign: 'center' }}>
              <Text color="#718096" size="sm">
                © 2023 DARA Medics. All rights reserved.
              </Text>
            </Box>
          </Flex>
        </Card>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;