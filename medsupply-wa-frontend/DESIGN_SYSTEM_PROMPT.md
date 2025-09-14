# Design System Implementation Prompt

## Overview
This prompt provides comprehensive guidelines for implementing clean, professional, and optimally spaced UI components based on the refined dashboard design system. Apply these principles to any page or component to ensure consistency and visual excellence.

## Core Design Principles

### 1. **Spacing Standards**
- **Card Spacing**: Use `gap="3xl"` (48px) for metric cards, `gap="2xl"` (32px) for main content sections
- **Component Internal Spacing**: Use `gap="4"` (16px) to `gap="8"` (32px) for optimal content separation
- **Button Spacing**: Use `gap="3"` (12px) for action buttons, `gap="5"` (20px) for header elements
- **Chart Spacing**: Use `gap="8"` (32px) between chart containers, `padding: '1rem'` (16px) inside charts
- **List Item Spacing**: Use explicit `marginBottom` instead of flex gaps for reliable visual separation

### 2. **Layout Optimization**
- **Grid vs Flex**: Use `Flex` with `calc()` widths for even distribution instead of `Grid` for better spacing control
- **Card Height**: Keep metric cards compact with `minHeight: '100px'` and `padding="4"`
- **Content Density**: Optimize information hierarchy by reducing unnecessary rows and combining related elements
- **Responsive Design**: Use `flex-wrap` and `justify="center"` for adaptive layouts

### 3. **Component Structure**
- **Card Design**: Use `elevation="sm"`, `backgroundColor: 'white'`, `border: '1px solid #f1f5f9'`
- **Typography**: Use smaller font sizes (`0.7rem` to `0.85rem`) for compact, professional appearance
- **Button Design**: Use icon-only buttons with `padding: '0.25rem 0.5rem'` for space efficiency
- **Badge Spacing**: Use `gap="6"` (24px) for badge containers with longer text

## Implementation Guidelines

### For Dashboard Pages:
```typescript
// Metric Cards Layout
<Flex gap="3xl" wrap justify="center">
  {metrics.map((metric, index) => (
    <Box key={index} style={{ flex: '0 0 auto', width: 'calc(25% - 36px)' }}>
      <MetricCard {...metric} />
    </Box>
  ))}
</Flex>

// Main Content Layout
<Flex gap="2xl" wrap justify="center">
  <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
    <Component1 />
  </Box>
  <Box style={{ flex: '0 0 auto', width: 'calc(50% - 16px)' }}>
    <Component2 />
  </Box>
</Flex>
```

### For Card Components:
```typescript
// Card Container
<Card 
  elevation="sm" 
  padding="5" 
  style={{ 
    height: '100%', 
    backgroundColor: 'white', 
    border: '1px solid #f1f5f9' 
  }}
>
  {/* Content */}
</Card>

// Chart Containers
<Box style={{ padding: '0.5rem' }}>
  <Text size="sm" color="#64748b" weight="medium" style={{ marginBottom: '0.75rem', fontSize: '0.8rem' }}>
    Chart Title
  </Text>
  <Box style={{
    height: '120px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '1rem',
    position: 'relative'
  }}>
    {/* Chart Content */}
  </Box>
</Box>
```

### For Action Buttons:
```typescript
// Compact Action Buttons
<Flex gap="3">
  <Button
    variant="ghost"
    size="sm"
    style={{ 
      padding: '0.25rem 0.5rem', 
      borderRadius: '4px',
      backgroundColor: 'transparent',
      border: '1px solid #e2e8f0',
      fontSize: '0.65rem',
      fontWeight: '500',
      minWidth: 'auto'
    }}
  >
    <Icon size={10} style={{ color: '#64748b' }} />
  </Button>
</Flex>
```

### For List Items:
```typescript
// List Item with Proper Spacing
{items.map((item, index) => (
  <Box
    key={index}
    style={{
      padding: '0.75rem',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: index < items.length - 1 ? '1rem' : '0'
    }}
  >
    {/* Item Content */}
  </Box>
))}
```

## Spacing Reference Table

| Element Type | Gap Value | Pixels | Usage |
|--------------|-----------|--------|-------|
| **Metric Cards** | `gap="3xl"` | 48px | Main dashboard metrics |
| **Main Content** | `gap="2xl"` | 32px | Large content sections |
| **Chart Containers** | `gap="8"` | 32px | Between chart cards |
| **Header Elements** | `gap="5"` | 20px | Title + action links |
| **Action Buttons** | `gap="3"` | 12px | Button groups |
| **Badge Containers** | `gap="6"` | 24px | Status badges |
| **Chart Internal** | `padding: '1rem'` | 16px | Inside chart containers |
| **List Items** | `marginBottom: '1rem'` | 16px | Between list items |

## Color and Typography Standards

### Colors:
- **Primary Text**: `#0f172a` (dark gray)
- **Secondary Text**: `#64748b` (medium gray)
- **Background**: `#f8fafc` (light gray)
- **Borders**: `#e2e8f0` (light border)
- **Card Background**: `white`

### Typography:
- **Headings**: `fontSize: '0.8rem'` to `1rem`, `fontWeight: '600'`
- **Body Text**: `fontSize: '0.75rem'` to `0.85rem`
- **Small Text**: `fontSize: '0.7rem'`
- **Button Text**: `fontSize: '0.65rem'`

## Quality Checklist

### Before Implementation:
- [ ] Verify all spacing uses the reference table values
- [ ] Ensure cards have proper elevation and borders
- [ ] Check that buttons are appropriately sized and spaced
- [ ] Confirm typography follows size standards
- [ ] Validate that list items have proper margins
- [ ] Test responsive behavior with flex-wrap

### After Implementation:
- [ ] No content elements are touching each other
- [ ] All spacing is visually consistent
- [ ] Cards have proper visual hierarchy
- [ ] Action buttons are easily clickable
- [ ] Layout is clean and professional
- [ ] No linting errors present

## Common Patterns

### 1. **Header with Actions**
```typescript
<Flex justify="space-between" align="center" style={{ marginBottom: '1.5rem' }}>
  <Heading as="h3" size="lg" margin="0" style={{ color: '#0f172a', fontWeight: '600' }}>
    Component Title
  </Heading>
  <Flex align="center" gap="5">
    <Text size="sm" color="#64748b" margin="0" weight="medium" style={{ fontSize: '0.8rem' }}>
      Status Text
    </Text>
    <Link variant="primary" size="sm" style={{ fontSize: '0.8rem', fontWeight: '500' }}>
      Action Link
    </Link>
  </Flex>
</Flex>
```

### 2. **Two-Column Chart Layout**
```typescript
<Grid columns={2} gap="8" style={{ marginBottom: '1.5rem' }}>
  <Box style={{ padding: '0.5rem' }}>
    {/* Chart 1 */}
  </Box>
  <Box style={{ padding: '0.5rem' }}>
    {/* Chart 2 */}
  </Box>
</Grid>
```

### 3. **Compact Order/Item Cards**
```typescript
<Box style={{
  padding: '0.75rem',
  backgroundColor: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  marginBottom: index < items.length - 1 ? '1rem' : '0'
}}>
  {/* Header with actions inline */}
  <Flex justify="space-between" align="center" style={{ marginBottom: '0.75rem' }}>
    <Box>
      {/* Title and subtitle */}
    </Box>
    <Flex align="center" gap="3">
      <Text weight="bold" size="lg" margin="0" style={{ color: '#0f172a', fontSize: '1rem' }}>
        Amount/Value
      </Text>
      <Flex gap="3">
        {/* Action buttons */}
      </Flex>
    </Flex>
  </Flex>
  
  {/* Status section */}
  <Flex justify="space-between" align="center">
    {/* Status badges and info */}
  </Flex>
</Box>
```

## Usage Instructions

1. **Copy the relevant patterns** for your component type
2. **Apply spacing values** from the reference table
3. **Follow the color and typography standards**
4. **Use the quality checklist** before finalizing
5. **Test responsive behavior** and spacing consistency
6. **Ensure no linting errors** are present

This design system ensures consistent, professional, and optimally spaced UI components across all pages and components in the application.
