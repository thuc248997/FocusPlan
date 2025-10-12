# 📅 FocusPlan

<div align="center">

![FocusPlan Logo](https://img.shields.io/badge/FocusPlan-Task%20Management-blue?style=for-the-badge&logo=calendar)

**A modern task management application with AI chat integration and Google Calendar sync**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Configuration](#-configuration) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### 📝 Task Management
- ✅ **Create & Edit Tasks** - Intuitive task creation with title, description, date, and time
- 🗑️ **Delete Tasks** - Easy task removal with confirmation
- 📊 **Task Organization** - Automatic grouping by date
- 🎯 **Task Tracking** - View all tasks in a clean, organized sidebar

### 📆 Google Calendar Integration
- 🔗 **OAuth 2.0 Authentication** - Secure Google Calendar connection
- ☁️ **Sync Tasks** - One-click sync tasks to Google Calendar
- 📅 **View Calendar** - Visual month calendar with your events
- 🔄 **Real-time Updates** - Automatic calendar refresh

### 💬 AI Chat Interface
- 🤖 **AI Assistant** - Chat with an AI assistant for task help
- 💭 **Single Chat Session** - One ongoing chat session (not persisted across reloads)
- 🎨 **Beautiful UI** - Modern chat interface with message bubbles
- ⚡ **Fast Responses** - Quick AI-powered responses

### 🎨 Modern UI/UX
- 🌙 **Dark Mode** - Eye-friendly dark theme
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Polished user experience with Framer Motion
- 🎯 **Intuitive Navigation** - Easy-to-use sidebar and interface

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Google Cloud Console Account** (for Calendar integration)

### Step 1: Clone the Repository

```bash
git clone https://github.com/thuc248997/FocusPlan.git
cd FocusPlan
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Calendar OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

> 📌 **How to get Google OAuth credentials:**
> 1. Go to [Google Cloud Console](https://console.cloud.google.com/)
> 2. Create a new project or select an existing one
> 3. Enable **Google Calendar API**
> 4. Create **OAuth 2.0 Client ID** credentials
> 5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
> 6. Copy Client ID and Client Secret to `.env.local`

### Step 4: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 Usage

### Creating a Task

1. Click **"New Task"** button in the sidebar
2. Fill in task details:
   - **Title** (required)
   - **Description** (optional)
   - **Date** (required)
   - **Start Time** (required)
   - **End Time** (required)
3. ✅ Check **"Sync to Google Calendar"** to sync (if connected)
4. Click **"Create Task"** to create

### Editing a Task

1. Hover over a task in the sidebar
2. Click the **✏️ Edit** icon
3. Update task information
4. ✅ Check **"Sync to Google Calendar"** to update calendar event
5. Click **"Update"** to save changes

### Connecting Google Calendar

1. Click **"Connect Google Calendar"** in the sidebar
2. Authorize FocusPlan to access your Google Calendar
3. Once connected, you'll see:
   - ✅ **"Calendar Connected"** badge
   - 📅 Calendar view on the right side
   - 🔄 Sync checkbox in task modals

### Using the Chat Interface

1. Type your message in the chat input
2. Press **Enter** or click **Send**
3. AI assistant will respond with helpful information
4. Conversations are not persisted across page reloads; use the "New Chat" button to clear the current session

---

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI library |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Framer Motion** | Animation library |
| **Lucide React** | Icon library |
| **Google Calendar API** | Calendar integration |

---

## 📁 Project Structure

```
FocusPlan/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # OAuth callbacks
│   │   │   └── calendar/      # Calendar API endpoints
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ChatArea.tsx       # Chat interface
│   │   ├── ChatInterface.tsx  # Main chat container
│   │   ├── EditTaskModal.tsx  # Edit task modal
│   │   ├── MessageBubble.tsx  # Chat message bubble
│   │   ├── MonthCalendar.tsx  # Calendar view
│   │   ├── NewTaskModal.tsx   # New task modal
│   │   └── Sidebar.tsx        # App sidebar
│   ├── lib/                   # Utility functions
│   │   ├── googleCalendar.ts  # Google Calendar utilities
│   │   └── utils.ts           # General utilities
│   └── types/                 # TypeScript types
│       └── index.ts           # Type definitions
├── public/                    # Static files
├── .env.local                 # Environment variables (not in repo)
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

---

## ⚙️ Configuration

### Google Calendar API Setup

1. **Enable API:**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Calendar API for your project

2. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Select **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

3. **Required Scopes:**
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Yes (for Calendar) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Yes (for Calendar) |

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Failed to sync task" Error

**Solution:**
1. Disconnect from Google Calendar (click "Calendar Connected")
2. Reconnect to refresh your authentication token
3. Try syncing again

#### ❌ OAuth Error: "redirect_uri_mismatch"

**Solution:**
1. Check that redirect URI in Google Console matches exactly
2. Must include protocol (`http://` or `https://`)
3. No trailing slashes

#### ❌ Tasks not saving

**Solution:**
- Check browser console for errors
- Clear localStorage and try again
- Ensure you're filling all required fields

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add comments for complex logic
- Test features before submitting PR

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Thuc PD**

- GitHub: [@thuc248997](https://github.com/thuc248997)
- Repository: [FocusPlan](https://github.com/thuc248997/FocusPlan)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Lucide](https://lucide.dev/) - Icon Library
- [Google Calendar API](https://developers.google.com/calendar) - Calendar Integration
- [Framer Motion](https://www.framer.com/motion/) - Animation Library

---

## 📊 Roadmap

- [ ] AI-powered task suggestions
- [ ] Recurring tasks support
- [ ] Task categories and tags
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Task reminders and notifications
- [ ] Export tasks to PDF/Excel
- [ ] Integration with other calendar services
- [ ] Multi-language support

---

## 📞 Support

If you have any questions or issues, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/thuc248997/FocusPlan/issues)
3. Create a new issue if needed

---

<div align="center">

**⭐ If you find this project helpful, please give it a star! ⭐**

Made with ❤️ by [Thuc PD](https://github.com/thuc248997)

</div>
