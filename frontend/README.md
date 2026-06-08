# Scrum Planning Poker - Frontend Client

This is the Vue 3 + TypeScript + Vite frontend client for the Scrum Planning Poker application.

## 🚀 Technologies Used

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **State Management**: [Pinia](https://pinia.vuejs.org/) / Reactive Stores for real-time room state
- **Routing**: [Vue Router](https://router.vuejs.org/)
- **Real-time Communication**: [Socket.io-client](https://socket.io/docs/v4/client-api/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) with custom premium glassmorphism layouts

## 📁 Project Structure

```bash
frontend/
├── src/
│   ├── assets/         # Images, global SVGs and logos
│   ├── components/     # UI, dialogs, chat, and room interaction elements
│   │   ├── dx/         # Design system wrapper components (glass card, buttons)
│   │   └── ui/         # Base UI components (shadcn-vue equivalents)
│   ├── lib/            # Utilities (formatting, tailwind merging)
│   ├── router/         # Vue routing setup
│   ├── stores/         # Room store for WebSockets sync
│   ├── views/          # HomeView and RoomView screens
│   ├── App.vue         # Root component
│   └── main.ts         # App entry point
```

## 🛠️ Setup & Installation

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

> [!NOTE]
> To run the entire workspace (both frontend and backend) simultaneously, use the root-level commands.
