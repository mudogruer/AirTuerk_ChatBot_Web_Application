import { useState } from 'react';
import styled from 'styled-components';
import ChatWindow from './ChatWindow';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Fab, Zoom } from '@mui/material';

const ChatBotContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: 10px;
    right: 10px;
  }
`;

const StyledFab = styled(Fab)`
  && {
    background-color: #E31E24;
    color: white;
    width: 64px;
    height: 64px;

    &:hover {
      background-color: #C41A1F;
    }

    svg {
      width: 32px;
      height: 32px;
    }

    @media (max-width: 768px) {
      width: 56px;
      height: 56px;

      svg {
        width: 28px;
        height: 28px;
      }
    }
  }
`;

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <ChatBotContainer>
      <Zoom in={!isOpen}>
        <StyledFab
          color="primary"
          aria-label="chat"
          onClick={toggleChat}
        >
          <SmartToyIcon />
        </StyledFab>
      </Zoom>
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
    </ChatBotContainer>
  );
};

export default ChatBot;
