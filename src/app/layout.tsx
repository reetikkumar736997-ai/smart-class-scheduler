import type { Metadata } from "next";
import ThemeToggle from "./theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Class Scheduler",
  description: "Teacher and student scheduling, announcements, materials, and study support.",
};

const themeScript = `
(() => {
  const storageKey = "smart-class-theme";
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";

  root.dataset.theme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
