export const Button = ({ label, onClick }: { label: string; onClick?: () => void }) => {
  // Shared button component (framework-agnostic helper)
  return { label, onClick };
};

export const Card = ({ title, content }: { title: string; content: string }) => {
  return { title, content };
};

export const colors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};
