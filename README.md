# AVA Dashboard Development Platform

A sophisticated Next.js dashboard framework designed for rapid development and deployment of customizable admin interfaces with database integration and modular component architecture.

## 🏗️ Architecture Overview

**AVA Dashboard** is built on a page-centric, agent-friendly architecture that combines:

- **Modular Page System**: Each dashboard page is self-contained with its own components, configuration, and styling
- **Dynamic Database Integration**: Seamless Supabase integration with real-time data updates
- **Component-Based Design**: Reusable UI components with TypeScript support
- **Theme Management**: Database-driven themes with real-time switching capabilities
- **MCP Server Integration**: Claude Code integration for AI-assisted development

## 🚀 Key Features

### 📊 Dashboard Pages
- **Main Dashboard**: KPI cards, navigation, and overview metrics
- **Database Manager**: Visual database administration and schema management
- **Task Management**: Project tracking with drag-and-drop functionality
- **Page Manager**: Dynamic page creation and configuration
- **Theme Gallery**: Live theme preview and customization
- **Claude CLI Chatbot**: Integrated AI assistant for development tasks

### 🔧 Technical Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with dynamic theming
- **Database**: Supabase with real-time subscriptions
- **Icons**: Lucide React
- **Build Tools**: PostCSS, Autoprefixer

### 🎨 Theming System
- Database-stored themes with live switching
- Component-level style customization
- Grid-based responsive layouts
- Dynamic color scheme management

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes for data management
│   └── [...page]/         # Dynamic page routing
├── pages/                 # Page modules
│   ├── dashboard/         # Main dashboard page
│   ├── databases/         # Database management
│   ├── tasks/            # Task management
│   ├── page-manager/     # Dynamic page creation
│   └── themes/           # Theme management
├── mcp/                  # Claude MCP server integration
└── database/             # Database schema and migrations
```

## 🛠️ Development Workflow

### Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Page Development
Each page follows a consistent structure:
- `config.yaml` - Page configuration and layout
- `components/` - Page-specific React components
- `hooks/` - Custom React hooks for data management
- `types.ts` - TypeScript type definitions
- `styles.css` - Page-specific styling

### Database Integration
- Automatic Supabase connection management
- Real-time data subscriptions
- Schema validation and migration tools
- Visual database administration interface

## 🎯 Use Cases

- **Admin Dashboards**: Rapid deployment of administrative interfaces
- **Data Visualization**: Real-time metrics and KPI tracking
- **Content Management**: Dynamic page and component management
- **Team Collaboration**: Project and task management workflows
- **Prototyping**: Quick mockup and concept validation

## 🔄 AI-Assisted Development

### Claude CLI Chatbot Integration
A sophisticated AI assistant built into the dashboard interface:
- **Real-time Interaction**: Direct Claude CLI integration via web interface
- **Context Awareness**: Automatically includes project and page context
- **Development Tasks**: File operations, code analysis, and system administration
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### MCP Server Features
Integrated with Claude Code MCP server for:
- Automated component generation
- Database schema management
- Theme customization
- Code refactoring and optimization
- Documentation generation

## 📋 Requirements

- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Claude CLI installed and configured
- Supabase project (for database features)

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Install Claude CLI: `curl -fsSL https://install.claude.ai/claude-code | sh`
4. Configure environment variables for Supabase
5. Run development server: `npm run dev`
6. Visit `http://localhost:3000` to access the dashboard
7. Try the chatbot on the Playground page (bottom-right corner)

### Claude CLI Chatbot Setup
The chatbot requires Claude CLI to be installed and accessible. The system will automatically detect the installation path, or you can set it manually:

```env
CLAUDE_CLI_PATH=/path/to/claude
CLAUDE_EXECUTION_TIMEOUT=300000  # 5 minutes (default)
```

For detailed setup instructions, see: [`docs/chatbot/README.md`](docs/chatbot/README.md)

## 🤝 Contributing

This project is designed for rapid iteration and customization. Each page module is self-contained, making it easy to:
- Add new dashboard pages
- Customize existing components
- Integrate additional data sources
- Extend theming capabilities

---

**Built for the AVI-Tech Team** | Powered by Next.js, Supabase, and Claude Code