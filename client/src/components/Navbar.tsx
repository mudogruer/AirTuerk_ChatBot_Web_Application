import styled from 'styled-components';
import { AppBar, Toolbar, Button } from '@mui/material';
import logo from '../assets/airtuerk-logo.svg';

const StyledAppBar = styled(AppBar)`
  background-color: #1B2632;
  box-shadow: none;
`;

const Logo = styled.img`
  height: 40px;
  margin-right: 20px;
`;

const NavButton = styled(Button)`
  color: white;
  text-transform: none;
  margin: 0 10px;
  font-size: 1rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const CockpitButton = styled(Button)`
  background-color: #E31E24;
  color: white;
  margin-left: auto;
  padding: 6px 20px;
  
  &:hover {
    background-color: #C41A1F;
  }
`;

const Navbar = () => {
  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Logo src={logo} alt="Airtuerk Logo" />
        <NavButton>Unternehmen</NavButton>
        <NavButton>Unser Angebot</NavButton>
        <NavButton>Partneragentur werden</NavButton>
        <NavButton>Über uns</NavButton>
        <NavButton>Karriere</NavButton>
        <CockpitButton variant="contained">Cockpit</CockpitButton>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;
