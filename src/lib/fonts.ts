import { Noto_Serif, Roboto } from "next/font/google";

export const notoSerif = Noto_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const fontVariables = `${roboto.variable} ${notoSerif.variable}`;
