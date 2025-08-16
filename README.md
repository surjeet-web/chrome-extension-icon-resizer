# Chrome Extension Icon Resizer

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shiv908s-projects/v0-chrome-extension-icon-resizer)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## Overview

Chrome Extension Icon Resizer is a powerful web application that helps developers quickly generate all the required icon sizes for Chrome extensions. Simply upload your SVG or PNG file, specify the sizes you need, and download a ZIP file with all the resized icons.

### Key Features

- **Multiple Format Support**: Upload SVG or PNG files for processing
- **Customizable Sizes**: Specify any icon dimensions you need (default: 16x16, 32x32, 48x48, 128x128)
- **Batch Processing**: Process multiple files at once
- **ZIP Download**: Get all generated icons in a single ZIP file
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Toggle between color schemes based on your preference

## How to Use

1. **Upload Files**: Drag and drop your SVG or PNG files, or click "Browse Files" to select them
2. **Set Sizes**: Enter comma-separated dimensions (e.g., "16,32,48,128") or use the default sizes
3. **Generate Icons**: Click "Generate Icons" to process your files
4. **Download Results**: Download individual icons or all icons as a ZIP file

## Supported Icon Sizes

Chrome extensions typically require these icon sizes:
- 16x16 (favicon)
- 32x32 (toolbar)
- 48x48 (extensions page)
- 128x128 (store and installation)

You can generate any custom sizes you need for your specific requirements.

## Technical Details

This application is built with modern web technologies:

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom color palette
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) built on [Radix UI](https://www.radix-ui.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started (Development)

To run this project locally, you'll need to have Node.js and pnpm installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/surjeet-web/chrome-extension-icon-resizer.git
   ```

2. **Install dependencies**:
   ```bash
   cd chrome-extension-icon-resizer
   pnpm install
   ```

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000` to see the application.

## Building for Production

To create a production build:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the coding standards used in the project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [v0.dev](https://v0.dev) for the initial project scaffolding
- Icons by [Lucide](https://lucide.dev/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

## Contact

For support, feature requests, or contributions, please open an issue on GitHub or contact the maintainer:

Surjeet Singh - [@surjeet_web](https://github.com/surjeet-web)

Project Link: [https://github.com/surjeet-web/chrome-extension-icon-resizer](https://github.com/surjeet-web/chrome-extension-icon-resizer)