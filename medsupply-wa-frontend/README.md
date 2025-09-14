# MedSupply-WA Frontend

A modern React-based frontend for the MedSupply-WA pharmacy wholesale management system.

## Features

- **Modern UI/UX**: Clean, responsive design following the MedSupply-WA design system
- **Authentication**: Complete login/register flow with protected routes
- **Dashboard**: Real-time metrics and performance indicators
- **Navigation**: Intuitive sidebar navigation with collapsible menu
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **TypeScript**: Full TypeScript support for better development experience
- **Styled Components**: CSS-in-JS styling with theme support

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **React Hook Form** - Form handling and validation
- **React Query** - Data fetching and caching
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Recharts** - Chart components
- **Date-fns** - Date utilities

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/shared components
│   ├── dashboard/      # Dashboard-specific components
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard page
│   └── ...             # Other feature pages
├── styles/             # Global styles and theme
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

## Design System

The frontend follows the MedSupply-WA design system with:

- **Colors**: Primary blue (#2F6EEB), success green, warning yellow, error red
- **Typography**: Inter font family with consistent sizing
- **Spacing**: 4px base unit system
- **Components**: Consistent button styles, form inputs, cards, etc.

## API Integration

The frontend is configured to proxy API requests to the backend server running on port 3000. Update the proxy setting in `package.json` if your backend runs on a different port.

## Development

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Add navigation item to `src/components/layout/Sidebar.tsx`

### Styling

Use styled-components with the theme system:

```tsx
import styled from 'styled-components';

const MyComponent = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.md};
`;
```

### Forms

Use React Hook Form for form handling:

```tsx
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm();
```

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Add proper TypeScript interfaces for props
4. Use the design system colors and spacing
5. Test your changes thoroughly

## License

This project is part of the MedSupply-WA system and follows the same licensing terms.
