import styled from 'styled-components';
import { Button } from '@mui/material';

const HeroSection = styled.div`
  background-color: #F5F5F5;
  padding: 60px 0;
  min-height: 500px;
  display: flex;
  align-items: center;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled.div`
  flex: 1;
  max-width: 600px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: #1B2632;
  margin-bottom: 20px;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: #4A4A4A;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
`;

const RedButton = styled(Button)`
  && {
    background-color: #E31E24;
    color: white;
    padding: 10px 30px;
    font-size: 1rem;
    text-transform: none;
    
    &:hover {
      background-color: #C41A1F;
    }
  }
`;

const OutlinedButton = styled(Button)`
  && {
    border: 2px solid #1B2632;
    color: #1B2632;
    padding: 10px 30px;
    font-size: 1rem;
    text-transform: none;
    
    &:hover {
      background-color: rgba(27, 38, 50, 0.1);
    }
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  
  img {
    max-width: 100%;
    height: auto;
  }
`;

const Hero = () => {
  return (
    <HeroSection>
      <Container>
        <Content>
          <Title>Wir wachsen gemeinsam!</Title>
          <Description>
            Die airtuerk Service GmbH ist der erste und größte Full Service-Consolidator 
            im türkischen Markt und unabhängiger Business-to-Business Dienstleister für Linienflüge.
          </Description>
          <ButtonGroup>
            <RedButton variant="contained">Unser Angebot</RedButton>
            <OutlinedButton variant="outlined">Kunde werden</OutlinedButton>
          </ButtonGroup>
        </Content>
        <ImageContainer>
          <img src="/business-man.jpg" alt="Business Professional" />
        </ImageContainer>
      </Container>
    </HeroSection>
  );
};

export default Hero;
