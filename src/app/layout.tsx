import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  title: "AWS Student Builder Group | RIMT University",
  description: "Official student-led cloud community of Amazon Web Services (AWS) at RIMT University. Build skills, attend bootcamps, and master cloud computing.",
  keywords: ["AWS", "RIMT University", "Student Builder Group", "Cloud Computing", "Amazon Web Services", "Generative AI", "Punjab Tech Clubs"],
  authors: [{ name: "AWS Student Builder Group Core Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${amazonEmberDisplay.variable} ${amazonEmberMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 selection:text-orange-300">
        <Header />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
