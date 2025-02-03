import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Paper, IconButton, TextField, Button, CircularProgress, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import { chatService } from '../../services/api/chatService';
import { Language, Message } from '../../types/chat';
import { FlightData } from '../../types/flight';
import { useNavigate } from 'react-router-dom';

interface ChatWindowProps {
  onClose: () => void;
}

const WindowContainer = styled(Paper)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 90vw;
  max-width: 800px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px !important;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2) !important;

  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    bottom: 10px;
    right: 10px;
  }
`;

const Header = styled.div`
  background-color: #1B2632;
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-left: 24px;
`;

const LanguageButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  opacity: ${props => props.active ? 1 : 0.6};
  transition: opacity 0.3s;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;

  &:hover {
    opacity: 1;
  }

  img {
    height: 20px;
    border-radius: 4px;
  }
`;

const FlightInfoContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #fff;
  padding: 12px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MessagesContainer = styled.div`
  padding: 24px;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
`;

const InputArea = styled.div`
  padding: 20px;
  background-color: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
`;

const MessageLine = styled.div<{ isUser?: boolean }>`
  max-width: 80%;
  margin: 12px 0;
  padding: 16px;
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  ${({ isUser }) => isUser
    ? `
      margin-left: auto;
      background-color: #E31E24;
      color: white;
    `
    : `
      margin-right: auto;
      background-color: white;
      color: #1B2632;
    `}
`;

const StyledTextField = styled(TextField)`
  flex: 1;

  .MuiInputBase-root {
    background-color: #f8f9fa;
  }
`;

const SendButton = styled(Button)`
  && {
    padding: 8px 24px;
    background-color: #E31E24;
    
    &:hover {
      background-color: #C41A1F;
    }

    &.Mui-disabled {
      background-color: #ccc;
    }
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin: 10px 0;
`;

const ErrorMessage = styled.div`
  color: #E31E24;
  text-align: center;
  margin: 10px 0;
  padding: 10px;
  background-color: rgba(227, 30, 36, 0.1);
  border-radius: 4px;
`;

const FlightInfo = styled.div`
  padding: 5px 15px;
  margin: 0;
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SearchButton = styled(Button)`
  && {
    min-width: 40px;
    padding: 8px;
    margin-left: 16px;
    background-color: #E31E24;
    color: white;
    
    &:hover {
      background-color: #c41a1f;
    }

    &:disabled {
      background-color: rgba(227, 30, 36, 0.5);
    }
  }
`;

const placeholders = {
  de: 'Ihre Nachricht...',
  en: 'Your message...',
  tr: 'Mesajınızı yazın...'
};

const ChatWindow = ({ onClose }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('de');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [flightData, setFlightData] = useState<FlightData>({
    departure: "",
    destination: "",
    start_date: "",
    end_date: "",
    return_start_date: "",
    return_end_date: "",
    one_way: true
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      handleAIResponse('Hello');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    const resetAndInitialize = async () => {
      setError(null);
      try {
        const response = await chatService.resetChat(sessionId);
        setMessages([]);
        setFlightData(response.flightData);
        handleAIResponse('Hello');
      } catch (error) {
        console.error('Error resetting chat:', error);
        setError('Failed to reset chat. Please try again.');
      }
    };

    if (isInitialized) {
      resetAndInitialize();
    }
  }, [selectedLanguage]);

  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);
  };

  const handleAIResponse = async (userInput: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.sendMessage(userInput, sessionId, selectedLanguage);
      
      if (response.response) {
        setMessages(prev => [...prev, { text: response.response, isUser: false }]);
        setFlightData(response.flightData);
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again later.', 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setMessage('');
      setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
      await handleAIResponse(userMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSearchClick = () => {
    if (flightData.departure && flightData.destination) {
      const queryParams = new URLSearchParams({
        departure: flightData.departure,
        destination: flightData.destination,
        startDate: flightData.start_date || '',
        returnDate: flightData.return_start_date || '',
        oneWay: flightData.one_way.toString()
      });
      
      navigate(`/flights/search?${queryParams.toString()}`);
    }
  };

  const renderFlightInfo = () => {
    if (!flightData.departure) {
      return null;
    }

    return (
      <FlightInfo>
        {flightData.departure && (
          <Chip
            icon={<FlightTakeoffIcon />}
            label={`From: ${flightData.departure}`}
            color="primary"
            variant="outlined"
            style={{ marginRight: '4px' }}
          />
        )}

        {flightData.destination && (
          <Chip
            icon={<FlightLandIcon />}
            label={`To: ${flightData.destination}`}
            color="primary"
            variant="outlined"
            style={{ marginRight: '4px' }}
          />
        )}

        {flightData.start_date && (
          <Chip
            icon={<EventIcon />}
            label={`Departure: ${flightData.start_date}${flightData.end_date ? ` - ${flightData.end_date}` : ''}`}
            color="primary"
            variant="outlined"
            style={{ marginRight: '4px' }}
          />
        )}

        {!flightData.one_way && flightData.return_start_date && (
          <Chip
            icon={<EventIcon />}
            label={`Return: ${flightData.return_start_date}${flightData.return_end_date ? ` - ${flightData.return_end_date}` : ''}`}
            color="primary"
            variant="outlined"
            style={{ marginRight: '4px' }}
          />
        )}
      </FlightInfo>
    );
  };

  return (
    <WindowContainer elevation={3}>
      <Header>
        <HeaderContent>
          <Title>
            AI Assistant
          </Title>
          <LanguageSelector>
            <LanguageButton 
              onClick={() => handleLanguageChange('de')} 
              active={selectedLanguage === 'de'}
              title="Deutsch"
            >
              <img src="https://flagcdn.com/w40/de.png" alt="German" />
            </LanguageButton>
            <LanguageButton 
              onClick={() => handleLanguageChange('en')} 
              active={selectedLanguage === 'en'}
              title="English"
            >
              <img src="https://flagcdn.com/w40/gb.png" alt="English" />
            </LanguageButton>
            <LanguageButton 
              onClick={() => handleLanguageChange('tr')} 
              active={selectedLanguage === 'tr'}
              title="Türkçe"
            >
              <img src="https://flagcdn.com/w40/tr.png" alt="Turkish" />
            </LanguageButton>
          </LanguageSelector>
        </HeaderContent>
        <IconButton size="small" onClick={onClose} style={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Header>

      <ChatArea>
        {flightData.departure && (
          <FlightInfoContainer>
            <FlightInfo>
              {renderFlightInfo()}
            </FlightInfo>
            <SearchButton
              variant="contained"
              onClick={handleSearchClick}
              disabled={!flightData.departure || !flightData.destination}
              title="Search Flights"
            >
              <SearchIcon />
            </SearchButton>
          </FlightInfoContainer>
        )}
        <MessagesContainer>
          {messages.map((msg, index) => (
            <MessageLine key={index} isUser={msg.isUser}>
              {msg.text}
            </MessageLine>
          ))}
          {isLoading && (
            <LoadingIndicator>
              <CircularProgress size={24} style={{ color: '#E31E24' }} />
            </LoadingIndicator>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </MessagesContainer>
      </ChatArea>

      <InputArea>
        <StyledTextField
          variant="outlined"
          size="medium"
          placeholder={placeholders[selectedLanguage]}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={4}
          fullWidth
          disabled={isLoading}
        />
        <SendButton
          variant="contained"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
        >
          <SendIcon />
        </SendButton>
      </InputArea>
    </WindowContainer>
  );
};

export default ChatWindow;
