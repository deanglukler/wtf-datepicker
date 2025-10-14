# Date Picker Demo

A simple, custom React date picker component built with Vite and designed for Vercel deployment.

## Features

- 📅 Custom date picker with calendar interface
- 🎨 Clean, modern UI design
- 📱 Responsive layout
- ✨ Smooth animations and transitions
- 🗓️ Month navigation
- 📍 Today's date highlighting
- ✅ Selected date display

## Development

### Start the development server:
```bash
./start-dev.sh
```

This will start the dev server and log output to `logs/dev.log`.

### View logs in real-time:
```bash
tail -f logs/dev.log
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

## Deployment

This project is configured for seamless deployment on Vercel. Simply connect your repository to Vercel and it will automatically build and deploy.

The project includes:
- Vite configuration optimized for Vercel
- `vercel.json` configuration file
- Production-ready build setup

## Project Structure

```
src/
├── components/
│   ├── DatePicker.jsx      # Main date picker component
│   └── DatePicker.css      # Date picker styles
├── App.jsx                 # Main app component
├── App.css                 # App-specific styles
├── index.css               # Global styles
└── main.jsx               # App entry point
```
