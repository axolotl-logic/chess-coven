import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chess Coven by Axolotl-Logic",
    short_name: "Chess Coven",
    description:
      "Exercise your chess vision through innovative fantasy themed games.",
    start_url: "/",
    display: "standalone",
    background_color: "#06050d",
    theme_color: "#06050d",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
