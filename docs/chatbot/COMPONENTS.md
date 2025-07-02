# Chatbot Components Reference

Detailed documentation for all chatbot React components.

## Component Architecture

```
ChatBot (Main Container)
├── ChatMessage (Message Display)
├── ChatInput (User Input)  
└── Loading States & Animations
```

## ChatBot Component

Main chatbot interface component that manages the overall chatbot state and UI.

### Location
`/src/pages/_shared/components/chatbot/ChatBot.tsx`

### Props
```typescript
interface ChatBotProps {
  className?: string;    // Additional CSS classes
}
```

### Features
- **Collapsible Interface**: Toggle between open/closed states
- **Message Management**: Maintains conversation history
- **API Integration**: Handles communication with Claude CLI
- **Loading States**: Shows loading indicator during execution
- **Error Handling**: Displays user-friendly error messages

### State Management
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

### Message Type Definition
```typescript
interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}
```

### Default System Message
The chatbot initializes with a welcome message:
```
Hello! I'm Claude, your AI assistant. I can help you with coding tasks, 
file operations, and system administration. What would you like to work on?
```

### CSS Classes
```css
.chatbot-container         /* Main container */
.chatbot-container.open    /* Expanded state */
.chatbot-container.closed  /* Collapsed state */
.chatbot-header           /* Header with title and toggle */
.chatbot-content          /* Main content area */
.chatbot-messages         /* Message container */
```

### Responsive Behavior
- **Desktop**: 400px width, fixed bottom-right position
- **Mobile**: Full width minus 40px margins, 70vh max height

---

## ChatMessage Component

Individual message display component with support for different message types.

### Location
`/src/pages/_shared/components/chatbot/ChatMessage.tsx`

### Props
```typescript
interface ChatMessageProps {
  message: {
    id: string;
    type: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isLoading?: boolean;
  };
}
```

### Message Types

#### User Messages
- **Alignment**: Right-aligned
- **Styling**: Blue background, white text
- **Avatar**: 👤 emoji
- **Appearance**: Speech bubble with right-side tail

#### Assistant Messages
- **Alignment**: Left-aligned
- **Styling**: Light gray background, dark text
- **Avatar**: 🤖 emoji
- **Appearance**: Speech bubble with left-side tail

#### System Messages
- **Alignment**: Center-aligned
- **Styling**: Yellow/amber background, centered text
- **Avatar**: ℹ️ emoji
- **Appearance**: Centered notification style

### Features
- **Timestamp Display**: Formatted as HH:MM
- **Content Wrapping**: Supports multi-line content with `white-space: pre-wrap`
- **Responsive Layout**: Adapts to screen size
- **Icon System**: Emoji-based avatars for visual distinction

### CSS Classes
```css
.chat-message           /* Base message container */
.chat-message.user      /* User message styling */
.chat-message.assistant /* Assistant message styling */
.chat-message.system    /* System message styling */
.message-header         /* Avatar and metadata */
.message-content        /* Message text content */
```

### Time Formatting
```typescript
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
```

---

## ChatInput Component

User input component with send functionality and keyboard shortcuts.

### Location
`/src/pages/_shared/components/chatbot/ChatInput.tsx`

### Props
```typescript
interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

### Features
- **Auto-resizing Textarea**: Grows with content (max 120px height)
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Send Button**: Visual send indicator with icon
- **Input Validation**: Prevents empty message submission
- **Disabled States**: Visual feedback when disabled

### Keyboard Handling
```typescript
const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};
```

### Auto-resize Logic
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setInput(e.target.value);
  
  if (textareaRef.current) {
    textareaRef.current.style.height = '40px';
    textareaRef.current.style.height = 
      `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
  }
};
```

### CSS Classes
```css
.chat-input-container    /* Main container */
.chat-input-wrapper      /* Input wrapper with border */
.chat-input             /* Textarea element */
.send-button            /* Send button */
.chat-input-hint        /* Helper text */
```

### Send Button States
- **Default**: Blue background, white icon
- **Hover**: Darker blue, slight transform
- **Disabled**: Gray background, no interaction
- **Active**: Pressed state with transform

---

## Shared Styling System

### CSS Variables
All components use CSS variables for consistent theming:

```css
--color-surface         /* #ffffff - Background colors */
--color-surfaceSecondary /* #f8fafc - Secondary backgrounds */
--color-border          /* #e5e7eb - Border colors */
--color-primary         /* #3b82f6 - Primary blue color */
--color-primaryDark     /* #2563eb - Darker primary */
--color-text            /* #1f2937 - Primary text */
--color-textSecondary   /* #6b7280 - Secondary text */
--font-family           /* Inter, system-ui, sans-serif */
```

### Animation System
```css
@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Transitions */
transition: all 0.3s ease;      /* Container states */
transition: all 0.2s ease;      /* Button interactions */
transition: border-color 0.2s ease; /* Focus states */
```

### Responsive Breakpoints
```css
@media (max-width: 768px) {
  /* Mobile-specific styles */
  .chatbot-container {
    width: calc(100vw - 40px);
  }
  
  .chat-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
```

## Component Integration

### Adding to Page Config
```yaml
components:
  - id: "chatbot"
    type: "ChatBot"
    position:
      col: 1
      row: 4
      span: 8
    props:
      className: "custom-chatbot-class"
```

### Component Registration
```typescript
import { ChatBot } from '../_shared/components';

componentRegistry.register(PAGE_ID, 'ChatBot', ChatBot as any);
```

### Export Structure
```typescript
// /src/pages/_shared/components/chatbot/index.ts
export { ChatBot } from './ChatBot';
export { ChatMessage } from './ChatMessage';
export { ChatInput } from './ChatInput';

// /src/pages/_shared/components/index.ts
export { ChatBot, ChatMessage, ChatInput } from './chatbot';
```

## Customization Examples

### Custom Styling
```typescript
<ChatBot className="my-custom-chatbot" />
```

```css
.my-custom-chatbot {
  --color-primary: #10b981; /* Green theme */
  bottom: 80px; /* Different position */
  right: 40px;
}
```

### Custom Messages
```typescript
const customMessage: Message = {
  id: Date.now().toString(),
  type: 'system',
  content: 'Welcome to the custom page!',
  timestamp: new Date()
};
```

## Testing Components

### Unit Test Examples
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatBot } from './ChatBot';

test('renders chatbot toggle button', () => {
  render(<ChatBot />);
  const toggleButton = screen.getByText('Claude Assistant');
  expect(toggleButton).toBeInTheDocument();
});

test('opens chatbot when clicked', () => {
  render(<ChatBot />);
  const toggleButton = screen.getByText('+');
  fireEvent.click(toggleButton);
  expect(screen.getByText('−')).toBeInTheDocument();
});
```

### Integration Testing
```typescript
test('sends message and receives response', async () => {
  // Mock API response
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        result: 'Test response'
      })
    })
  );

  render(<ChatBot />);
  
  // Open chatbot and send message
  fireEvent.click(screen.getByText('+'));
  const input = screen.getByPlaceholderText('Type your message...');
  fireEvent.change(input, { target: { value: 'Test message' } });
  fireEvent.click(screen.getByRole('button', { name: /send/i }));
  
  // Wait for response
  await waitFor(() => {
    expect(screen.getByText('Test response')).toBeInTheDocument();
  });
});
```

## Performance Considerations

### Optimization Features
- **Message Virtualization**: Consider for large message histories
- **Debounced Input**: Prevent excessive re-renders
- **Memoized Components**: Use React.memo for message components
- **Lazy Loading**: Load components only when needed

### Memory Management
- **Message Limits**: Consider limiting message history
- **Event Cleanup**: Proper event listener cleanup
- **API Cleanup**: Abort requests on component unmount

## Accessibility

### ARIA Labels
```typescript
<button
  aria-label="Toggle chatbot"
  aria-expanded={isOpen}
  className="chatbot-toggle"
>
```

### Keyboard Navigation
- Tab order: Toggle → Input → Send button
- Enter/Space for button activation
- Arrow keys for textarea navigation
- Escape to close chatbot

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Message announcements for new assistant messages

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Required
- None (uses modern features with fallbacks)

### Known Issues
- iOS Safari: Font size must be ≥16px to prevent zoom
- Internet Explorer: Not supported (uses modern JS features)