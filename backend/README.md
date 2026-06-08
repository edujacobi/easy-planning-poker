# Scrum Planning Poker - Backend Server

This is the NestJS backend API and WebSocket server for the Scrum Planning Poker application.

## 🚀 Technologies Used

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Real-time Communication**: [Socket.io](https://socket.io/) (via NestJS WebSockets gateway)
- **Utilities**: Statistics algorithms (Median, Mean, Mode) for voting aggregation
- **Architecture**: Domain-driven modules (`rooms`) and services

## 📁 Project Structure

```bash
backend/
├── src/
│   ├── rooms/
│   │   ├── models/     # Room, Participant, Story, Task, and Message entities
│   │   ├── rooms.controller.ts  # HTTP routes (room creation, querying details)
│   │   ├── rooms.gateway.ts     # Socket.io event listeners & broadcasters
│   │   ├── rooms.module.ts      # NestJS module configuration
│   │   └── rooms.service.ts     # Business logic & in-memory session states
│   ├── app.module.ts   # Root module
│   └── main.ts         # NestJS application bootstrap
├── test/               # E2E & unit tests setup
```

## 🛠️ Setup & Installation

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# Install dependencies
npm install

# Start NestJS server in development/watch mode
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

---

> [!NOTE]
> The backend runs on port `3000` by default. To start both the client and server concurrently, run `npm run dev` in the root folder.
