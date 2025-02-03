import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { flightService, Flight } from '../services/api/flightService';
import { PageContainer, Card, Title, Subtitle, Text } from '../styles/components';
import { theme } from '../styles/theme';
import Navbar from '../components/Navbar';

const SearchInfo = styled(Card)`
  background: linear-gradient(135deg, ${theme.colors.secondary}, ${theme.colors.primary});
  color: ${theme.colors.text.light};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};

  ${Title} {
    color: ${theme.colors.text.light};
    margin-bottom: ${theme.spacing.sm};
  }

  ${Text} {
    color: ${theme.colors.text.light}dd;
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const FlightCard = styled(Card)`
  margin: ${theme.spacing.md} 0;
  padding: 0;
  overflow: hidden;
  border: none;
  box-shadow: ${theme.shadows.md};
`;

const FlightHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};

  strong {
    color: ${theme.colors.secondary};
    font-size: ${theme.typography.fontSize.md};
  }

  span {
    color: ${theme.colors.text.tertiary};
  }
`;

const FlightInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-bottom: 1px solid ${theme.colors.border};
`;

const TimeInfo = styled.div`
  flex: 1;
  text-align: center;
  padding: ${theme.spacing.sm};
  position: relative;
`;

const Time = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const Airport = styled.div`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const Date = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.tertiary};
`;

const Arrow = styled.div`
  color: ${theme.colors.primary};
  font-size: ${theme.typography.fontSize.xl};
  padding: 0 ${theme.spacing.sm};
`;

const PriceInfo = styled.div`
  text-align: right;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.md};
  min-width: 150px;
`;

const Price = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  margin: ${theme.spacing.xs} 0;
`;

const FareClass = styled.div`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.secondary};
  color: ${theme.colors.text.light};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const BaggageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
  margin-top: ${theme.spacing.sm};

  &:before {
    content: '🧳';
  }
`;

const NoFlights = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.tertiary};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing.md} 0;
  font-weight: ${theme.typography.fontWeight.medium};
  border: 2px dashed ${theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '✈️';
    font-size: 48px;
    opacity: 0.1;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const SectionTitle = styled.h3`
  color: #1a1a1a;
  margin: 24px 0 16px;
  font-size: 20px;
`;

interface GroupedFlight {
  flightNumber: string;
  airlineCode: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  options: {
    fareClass: string;
    price: number;
    baggage: number;
  }[];
}

const FareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
`;

const FareOption = styled.div<{ isSelected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.isSelected ? theme.colors.surface : theme.colors.background};
  border: 1px solid ${props => props.isSelected ? theme.colors.primary : theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.sm};
  }
`;

const FareFeatures = styled.div`
  text-align: center;
  margin-top: ${theme.spacing.sm};
`;

const FlightSearch = () => {
  const [searchParams] = useSearchParams();
  const [outboundFlights, setOutboundFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchFlights = async () => {
      try {
        const response = await flightService.searchFlights({
          departure: searchParams.get('departure'),
          destination: searchParams.get('destination'),
          startDate: searchParams.get('startDate'),
          returnDate: searchParams.get('returnDate'),
          oneWay: searchParams.get('oneWay')
        });

        setOutboundFlights(response.outboundFlights);
        setReturnFlights(response.returnFlights);
      } catch (err) {
        setError('Failed to load flights. Please try again.');
        console.error('Error fetching flights:', err);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get('departure') && searchParams.get('destination')) {
      searchFlights();
    } else {
      setError('Missing search parameters');
      setLoading(false);
    }
  }, [searchParams]);

  const groupFlights = (flights: Flight[]): GroupedFlight[] => {
    const grouped = flights.reduce((acc, flight) => {
      const key = `${flight.flightNumber}-${flight.departureTime}`;
      if (!acc[key]) {
        acc[key] = {
          flightNumber: flight.flightNumber,
          airlineCode: flight.airlineCode,
          departureAirport: flight.departureAirport,
          arrivalAirport: flight.arrivalAirport,
          departureDate: flight.departureDate,
          departureTime: flight.departureTime,
          arrivalDate: flight.arrivalDate,
          arrivalTime: flight.arrivalTime,
          options: []
        };
      }
      
      acc[key].options.push({
        fareClass: flight.fareClass,
        price: flight.price,
        baggage: flight.baggage
      });
      
      return acc;
    }, {} as Record<string, GroupedFlight>);

    return Object.values(grouped).sort((a, b) => {
      const minPriceA = Math.min(...a.options.map(o => o.price));
      const minPriceB = Math.min(...b.options.map(o => o.price));
      return minPriceA - minPriceB;
    });
  };

  const renderFlightCard = (flight: GroupedFlight) => (
    <FlightCard key={`${flight.flightNumber}-${flight.departureTime}`}>
      <FlightHeader>
        <div>
          <strong>{flight.airlineCode}</strong> <span>{flight.flightNumber}</span>
        </div>
      </FlightHeader>
      
      <FlightInfo>
        <TimeInfo>
          <Time>{flight.departureTime}</Time>
          <Airport>{flight.departureAirport}</Airport>
          <Date>{flight.departureDate}</Date>
        </TimeInfo>
        
        <Arrow>→</Arrow>
        
        <TimeInfo>
          <Time>{flight.arrivalTime}</Time>
          <Airport>{flight.arrivalAirport}</Airport>
          <Date>{flight.arrivalDate}</Date>
        </TimeInfo>
      </FlightInfo>

      <FareOptions>
        {flight.options
          .sort((a, b) => a.price - b.price)
          .map((option, index) => (
            <FareOption key={option.fareClass}>
              <FareClass>{option.fareClass}</FareClass>
              <Price>€{option.price.toFixed(2)}</Price>
              <FareFeatures>
                <BaggageInfo>{option.baggage}kg</BaggageInfo>
              </FareFeatures>
            </FareOption>
          ))}
      </FareOptions>
    </FlightCard>
  );

  if (loading) return (
    <>
      <Navbar />
      <div>Loading...</div>
    </>
  );
  
  if (error) return (
    <>
      <Navbar />
      <div>{error}</div>
    </>
  );

  return (
    <>
      <Navbar />
      <PageContainer>
        <SearchInfo>
          <Title>Flight Search Results</Title>
          <Text>
            {searchParams.get('departure')} → {searchParams.get('destination')}
            {searchParams.get('startDate') && ` on ${searchParams.get('startDate')}`}
          </Text>
        </SearchInfo>

        <Subtitle>Outbound Flights</Subtitle>
        {outboundFlights.length === 0 ? (
          <NoFlights>No flights found for this route and date.</NoFlights>
        ) : (
          groupFlights(outboundFlights).map(renderFlightCard)
        )}

        {!searchParams.get('oneWay') && (
          <>
            <Subtitle>Return Flights</Subtitle>
            {returnFlights.length === 0 ? (
              <NoFlights>No return flights found.</NoFlights>
            ) : (
              groupFlights(returnFlights).map(renderFlightCard)
            )}
          </>
        )}
      </PageContainer>
    </>
  );
};

export default FlightSearch; 