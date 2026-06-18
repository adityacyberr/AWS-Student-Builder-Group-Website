import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { headers } from "next/headers";

const amazonEmberDisplay = localFont({
  src: [
    {
      path: "../../public/fonts/AmazonEmberDisplay_Lt.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/AmazonEmberDisplay_Rg.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/AmazonEmberDisplay_Md.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/AmazonEmberDisplay_Bd.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/AmazonEmberDisplay_He.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-ember",
});

const amazonEmberMono = localFont({
  src: [
    {
      path: "../../public/fonts/AmazonEmberMono_Rg.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/AmazonEmberMono_Bd.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-ember-mono",
});

export const metadata: Metadata = {
  title: "AWS | RIMT University",
  description: "Official AWS Student Builder Group at RIMT University. Learn, build, collaborate, and innovate through cloud technologies.",
  keywords: ["AWS", "RIMT University", "Student Builder Group", "Cloud Computing", "Amazon Web Services", "Generative AI", "Punjab Tech Clubs"],
  authors: [{ name: "AWS Student Builder Group Core Team" }],
  openGraph: {
    title: "AWS | RIMT University",
    description: "Official AWS Student Builder Group at RIMT University. Learn, build, collaborate, and innovate through cloud technologies.",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "AWS Student Builder Group - RIMT University & DRI Lab",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS | RIMT University",
    description: "Official AWS Student Builder Group at RIMT University. Learn, build, collaborate, and innovate through cloud technologies.",
    images: ["/brand/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isConsole = host.startsWith("console.");

  return (
    <html
      lang="en"
      className={`${amazonEmberDisplay.variable} ${amazonEmberMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-300">
        <AuthProvider>
          {!isConsole && <Header />}
          {!isConsole && <AnnouncementBanner />}
          <main className="flex-grow flex flex-col">{children}</main>
          {!isConsole && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}

