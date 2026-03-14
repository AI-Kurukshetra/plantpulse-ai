import './globals.css';
import { AuthSessionSync } from '@/components/auth/AuthSessionSync';
import { appMetadata } from '@/lib/metadata';

export const metadata = appMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionSync />
        {children}
      </body>
    </html>
  );
}
