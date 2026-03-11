# Get Yo Frozen Yogurt

This is the official codebase for the Get Yo Frozen Yogurt website, built with modern web technologies to ensure maximum performance, accessibility, and SEO.

## Architecture

The project is built using the Astro framework and styled with Tailwind CSS, utilizing a component-driven architecture for high maintainability.

### Core Technologies
- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel (Edge Network)

## Project Structure

The repository is organized to separate concerns and facilitate easy content updates:

```text
/
├── public/                 # Static assets (images, fonts, certs) served directly
├── src/
│   ├── components/         # Reusable Astro UI components (Header, Footer, Gallery, etc.)
│   ├── layouts/            # Global page layouts and root HTML structures
│   ├── pages/              # Application routes and endpoints
│   ├── scripts/            # Client-side JavaScript logic
│   └── styles/             # Global CSS and Tailwind configurations
├── astro.config.mjs        # Astro project configuration
├── package.json            # Project dependencies and npm scripts
└── tailwind.config.mjs     # Tailwind CSS theme and utility definitions
```

## Getting Started

### Prerequisites
- Node.js (version 22.12.0 or higher recommended)
- npm (Node Package Manager)

### Installation

1. Clone the repository and navigate to the project root.
2. Install the necessary dependencies:

```bash
npm install
```

### Development Server

To start the local development server:

```bash
npm run dev
```
The application will be accessible at `http://localhost:4321`.

## Production Build

To build the project for production deployment:

```bash
npm run build
```
The optimized production files will be generated in the `dist/` directory. You can preview the production build locally using:

```bash
npm run preview
```

## Code Quality and Auditing

The project includes several built-in scripts to maintain code quality and performance standards.

### Formatting and Linting

To check the codebase for formatting and type errors:
```bash
npm run check
```

To automatically format the code and fix issues:
```bash
npm run fix
```

### Lighthouse Auditing

The project aims for a perfect 100/100 Lighthouse score across Performance, Accessibility, Best Practices, and SEO.

To run a local Lighthouse audit:
```bash
npm run lighthouse
```

To run a CI/CD targeted Lighthouse audit:
```bash
npm run lighthouse:ci
```

To run an audit against the live production site:
```bash
npm run lighthouse:live
```
