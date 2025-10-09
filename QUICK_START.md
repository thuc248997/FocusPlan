# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a New Chat
1. Click the "New Chat" button in the sidebar
2. Type your message in the input field
3. Press Enter to send (Shift+Enter for new line)

### Managing Chats
- **Switch Chat:** Click on any chat in the sidebar
- **Delete Chat:** Hover over a chat and click the trash icon
- **View History:** Chats are automatically grouped by date (Today, Yesterday, etc.)

### Mobile Usage
- Tap the menu icon (☰) to open/close the sidebar
- Tap outside the sidebar to close it

## Features

### Current Features
- Multiple chat sessions
- Persistent chat history
- Markdown message formatting
- Responsive design
- Dark mode interface

### Mock AI Responses
Currently using mock responses. To integrate real AI:

1. Add API key to `.env.local`:
```bash
OPENAI_API_KEY=your_key_here
```

2. Create API route in `src/app/api/chat/route.ts`

3. Update `ChatInterface.tsx` to call the API

## Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Cmd/Ctrl + K` - New chat (coming soon)

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Clear Chat History
Open browser console and run:
```javascript
localStorage.clear()
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Set up the development environment
2. ✅ Explore the chat interface
3. 🔲 Integrate real AI API
4. 🔲 Add authentication
5. 🔲 Deploy to production

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Lucide Icons](https://lucide.dev)

---

Happy coding! 🚀
