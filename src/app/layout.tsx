import { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Financé",
  description: "A finance app for the financially disorganized",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // important for iPhone notch safe-area
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`min-h-dvh ${publicSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
