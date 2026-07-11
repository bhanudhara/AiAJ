import "./teacher/global.css";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automated AI Daily Assessment System',
  description: 'Teacher and student daily assessment flow powered by Supabase and Gemini',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
