import { createGlobalStyle, ThemeProvider } from 'styled-components'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ChatBot from './components/ChatBot/ChatBot'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import FlightSearch from './pages/FlightSearch'
import { theme } from './styles/theme'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }
`

const HomePage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <ChatBot />
    </>
  )
}

const PageWithChat = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <ChatBot />
    </>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flights/search" element={
            <PageWithChat>
              <FlightSearch />
            </PageWithChat>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
