import './globals.css'

export const metadata = {
  title: 'v-oem Control System',
  description: 'Industrial Tinting Control UI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
