# Chat AI Application - Documentation

## Overview
This is a modern, ChatGPT-style AI chatbot application built with Next.js 14, React 18, TypeScript, and Tailwind CSS. The design is based on the Figma mockups and provides a clean, intuitive interface for AI-powered conversations.

## Features

### Core Features
- ✅ Real-time chat interface
- ✅ Multiple chat sessions
- ✅ Chat history with date grouping
- ✅ Persistent storage (localStorage)
- ✅ Responsive design (mobile & desktop)
- ✅ Dark mode interface
- ✅ Markdown support for messages
- ✅ Message suggestions
- ✅ User authentication UI

### UI/UX Features
- Collapsible sidebar
- Smooth animations
- Chat deletion
- Auto-scrolling messages
- Multi-line input with auto-resize
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Project Structure

```
FocusPlan/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page (chat interface)
│   │   ├── signup/       # Sign up page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ChatInterface.tsx  # Main chat container
│   │   ├── ChatArea.tsx       # Chat messages & input
│   │   ├── Sidebar.tsx        # Chat history sidebar
│   │   └── MessageBubble.tsx  # Individual message component
│   ├── lib/              # Utility functions
│   │   └── utils.ts      # Helper functions
│   └── types/            # TypeScript types
│       └── index.ts      # Type definitions
├── public/               # Static assets
├── design/              # Figma design screenshots
└── package.json         # Dependencies
```

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Icons:** Lucide React
- **Markdown:** React Markdown
- **Animations:** Framer Motion

### Data Storage
- **Local Storage:** For chat history and user data
- **Future:** Can be extended with database (PostgreSQL, MongoDB, etc.)

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Key Components

### ChatInterface
Main container component that manages:
- Chat state
- Message handling
- Chat creation/deletion
- Local storage persistence

### Sidebar
Left sidebar component featuring:
- New chat button
- Chat history grouped by date
- Chat selection
- Chat deletion
- User profile section

### ChatArea
Main chat area with:
- Message display
- Welcome screen
- Message input
- Suggested prompts

### MessageBubble
Individual message component with:
- User/AI distinction
- Markdown rendering
- Avatar icons

## State Management

Currently using React's built-in state management:
- `useState` for component state
- `useEffect` for side effects
- `localStorage` for persistence

Future improvements could include:
- Redux/Zustand for complex state
- React Query for API calls
- Context API for global state

## Styling

### Color Scheme
- **Background:** `#343541` (chat-bg)
- **Sidebar:** `#202123` (sidebar-bg)
- **AI Messages:** `#444654` (ai-msg)
- **Input:** `#40414f` (input-bg)
- **Accent:** Purple/Pink gradient

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## API Integration (Future)

To integrate with a real AI API (like OpenAI):

1. Create an API route: `src/app/api/chat/route.ts`
2. Add your API key to `.env.local`
3. Update the `handleSendMessage` function in `ChatInterface.tsx`

Example:
```typescript
// src/app/api/chat/route.ts
import { OpenAI } from 'openai'

export async function POST(req: Request) {
  const { message } = await req.json()
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  })
  
  return Response.json({ 
    message: completion.choices[0].message.content 
  })
}
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- AWS Amplify
- Docker container

## Future Enhancements

### Features
- [ ] Real AI integration (OpenAI, Anthropic, etc.)
- [ ] User authentication (OAuth, JWT)
- [ ] Database integration
- [ ] Chat sharing
- [ ] Export chat history
- [ ] Voice input
- [ ] Image generation
- [ ] Code syntax highlighting
- [ ] File uploads
- [ ] Multi-language support

### Technical
- [ ] Server-side rendering for better SEO
- [ ] Progressive Web App (PWA)
- [ ] Real-time collaboration
- [ ] Rate limiting
- [ ] Analytics
- [ ] Error tracking (Sentry)
- [ ] Unit tests (Jest, React Testing Library)
- [ ] E2E tests (Playwright, Cypress)

## Performance Optimization

Current optimizations:
- Next.js automatic code splitting
- React 18 concurrent features
- Client-side rendering for interactive components
- Lazy loading for components

Future optimizations:
- Image optimization
- Server-side caching
- CDN for static assets
- Bundle size reduction

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a personal project, but contributions are welcome:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

## Credits

- Design inspired by ChatGPT
- Figma design: ChatGPT v4.5 (Community)
- Icons: Lucide React
- Built with ❤️ using Next.js

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Basic chat functionality
- Multiple chat sessions
- Local storage persistence
- Responsive design
- Sign up page
- Mock AI responses

---

**Last Updated:** October 9, 2025
