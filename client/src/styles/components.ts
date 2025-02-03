import styled from 'styled-components';
import { theme } from './theme';

export const PageContainer = styled.div`
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: ${theme.spacing.lg};
`;

export const Card = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  
  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
    transition: all 0.2s ease;
  }
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'text' }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.md};
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return `
          background: ${theme.colors.secondary};
          color: ${theme.colors.text.light};
          &:hover {
            background: ${theme.colors.secondary}ee;
          }
        `;
      case 'text':
        return `
          background: transparent;
          color: ${theme.colors.text.primary};
          &:hover {
            background: ${theme.colors.surface};
          }
        `;
      default:
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.text.light};
          &:hover {
            background: ${theme.colors.primaryHover};
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Title = styled.h1`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing.lg};
`;

export const Subtitle = styled.h2`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing.md};
`;

export const Text = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.md};
  line-height: 1.5;
`; 