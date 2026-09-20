import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DesignOS Studio',
  description: 'Design Intelligence Operating System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 font-sans antialiased">
        <div className="flex h-screen">
          <nav className="w-64 border-r border-neutral-800 p-4 flex flex-col gap-2">
            <h1 className="text-xl font-bold mb-4">DesignOS</h1>
            <a href="/projects" className="px-3 py-2 rounded hover:bg-neutral-800">Projects</a>
          </nav>
          <main className="flex-1 overflow-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
