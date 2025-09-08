# 🎮 Games E-commerce Frontend

This directory contains the user-facing frontend for the Games E-commerce platform, built with **Next.js**. It provides a modern, responsive, and feature-rich user interface for browsing, searching, and managing games.

## 🏛️ Architectural Overview

The frontend is built using the **Next.js App Router**, which enables a hybrid approach of server-side and client-side rendering. This architecture ensures optimal performance, SEO, and a great user experience.

The main architectural concepts are:

1.  **React Server Components (RSCs):** Most components are rendered on the server, fetching data directly and sending lightweight HTML to the client. This reduces the amount of JavaScript shipped to the browser, leading to faster initial page loads.
2.  **Client Components:** Components requiring interactivity, state, and browser-only APIs (like `useState`, `useEffect`) are explicitly marked with `"use client"` and are rendered on the client-side.
3.  **UI Libraries:** The interface is styled with **Tailwind CSS** for a utility-first approach and uses **Shadcn/UI** and **Material-UI** for pre-built, accessible components.
4.  **State Management & Forms:** Client-side state and forms are handled using **React Hook Form** for performance and **Zod** for schema validation.
5.  **Authentication:** User authentication is managed using **NextAuth.js**, providing a secure and seamless login experience.

## 📁 Folder Structure

The project follows the standard Next.js App Router structure, organizing the application by routes.

```bash
/frontend-next
|
|-- /app
|   |-- /(administration)   # Group for admin-only routes
|   |   |-- /admin
|   |
|   |-- /(public)           # Group for public routes
|   |   |-- /signin
|   |
|   |-- /api                # API routes (e.g., NextAuth)
|   |-- /components         # Shared UI components
|   |   |-- /base           # Generic, reusable components
|   |   `-- /ui             # Components from Shadcn/UI
|   |
|   |-- /lib                # Helper functions and utilities
|   |-- /schemas            # Zod validation schemas
|   |-- layout.tsx          # Root layout
|   `-- page.tsx            # Homepage
|
|-- /public                 # Static assets (images, fonts)
|-- package.json            # Project dependencies and scripts
`-- next.config.ts        # Next.js configuration
```

## 🚀 Getting Started Locally

First, install the project dependencies using your preferred package manager:

```Bash
bun install
bun run dev
```

Open http://localhost:3000 with your browser to see the result.

## 🐳 Running the Application with Docker

For a streamlined setup, you can run the entire application using Docker Compose.

- **Network**:
  (Create a network for the communication, if it's not already created)

  ```bash
  docker network create app-network
  ```

- **Production Mode:**
  (Optimized for performance and stability)
  ```bash
  chmod +x ./start-prod.sh
  ./start-prod.sh
  ```
- **Stopping the Application:**
  (To stop and remove all the containers)
  ```bash
  chmod +x ./stop.sh
  ./stop.sh
  ```

## 🧪 Testing

To ensure the reliability of the application, you can run the provided tests.

- **API Service Tests:**

  ```bash
  bun run test
  ```
