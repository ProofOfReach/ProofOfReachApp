import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" className="dark">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="A decentralized advertising marketplace built on Nostr protocol with Lightning Network payments" />
        <meta name="theme-color" content="#9333ea" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Replit theme override for consistent dark mode styling */}
        <link rel="stylesheet" href="/replit-theme-override.css" />
        
        {/* Custom API documentation - no external dependencies needed */}
      </Head>
      <body className="dark:bg-gray-900">
        <Main />
        <NextScript />
        
        {/* Script to ensure correct theme mode */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Set dark mode by default for Replit compatibility
              document.documentElement.classList.add('dark');
              
              // Check if test mode is enabled in localStorage
              if (localStorage.getItem('isTestMode') === 'true') {
                console.log('Test mode detected on page load');
              }
            })();
          `
        }} />
      </body>
    </Html>
  )
}
