import './globals.css'

export const metadata = {
  title: 'KAVI AI Chat',
  description: 'AI Chat Application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
