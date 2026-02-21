import './globals.css'

export const metadata = {
  title: 'v-oem Control System',
  description: 'Industrial Tinting Control UI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  )
}
