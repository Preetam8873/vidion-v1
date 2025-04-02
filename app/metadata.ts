import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Vidion",
  description: "Watch and share videos with the world",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "https://i.postimg.cc/gjNkMv4W/256.png",
        sizes: "any",
      },
      {
        url: "https://i.postimg.cc/761Lzv2b/32px.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "https://i.postimg.cc/gjNkMv4W/256.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
    apple: [
      {
        url: "https://i.postimg.cc/pTMTyVyg/15px.png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/manifest.json",
} 