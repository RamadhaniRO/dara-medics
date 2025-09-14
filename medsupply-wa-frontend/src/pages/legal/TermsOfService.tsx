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

const TermsOfService: React.FC = () => {
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
              Terms of Service
            </Heading>
            
            <Text color="#718096" size="lg" style={{ marginTop: '0.5rem' }}>
              Last updated: December 2023
            </Text>

            <Box style={{ marginTop: '2rem' }}>
              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                1. Acceptance of Terms
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                By accessing and using DARA Medics services, you accept and agree to be bound by the terms and provision of this agreement.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                2. Use License
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Permission is granted to temporarily download one copy of the materials (information or software) on DARA Medics's website for personal, non-commercial transitory viewing only.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                3. Disclaimer
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                The materials on DARA Medics's website are provided on an 'as is' basis. DARA Medics makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                4. Limitations
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                In no event shall DARA Medics or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DARA Medics's website.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                5. Revisions and Errata
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                The materials appearing on DARA Medics's website could include technical, typographical, or photographic errors. DARA Medics does not warrant that any of the materials on its website are accurate, complete or current.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                6. Links
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                DARA Medics has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by DARA Medics of the site.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                7. Site Terms of Use Modifications
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                DARA Medics may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Use.
              </Text>

              <Heading as="h2" size="xl" color="#2d3748" style={{ marginBottom: '1rem' }}>
                8. Governing Law
              </Heading>
              <Text color="#4a5568" style={{ fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Any claim relating to DARA Medics's website shall be governed by the laws of the State of [Your State] without regard to its conflict of law provisions.
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

export default TermsOfService;