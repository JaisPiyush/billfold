import { Options } from "$fresh/plugins/twind.ts";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      container: {
        center: true,
      },
      colors: {
        gray: {
          "50": "27292F",
          "100": "#8e8e94",
          "200": "#141518",
          "300": "rgba(0, 0, 0, 0.6)",
          "400": "rgba(0, 0, 0, 0.87)",
          "500": "rgba(0, 0, 0, 0.23)",
          "600": "rgba(255, 255, 255, 0.2)",
        },
        gold: { "100": "#f3ef52", "200": "#fdbf00" },
        black: "#000",
        orange: "#f99a0e",
        aliceblue: "#f3f7fb",
        whitesmoke: "#eaeaea",
        saddlebrown: "#99600a",
        peru: "#9e6104",
        "primary-contrast": "#fff",
        slategray: "#576074",
        darkslategray: { "100": "#434343", "200": "#424242", "300": "#303030" },
        cornflowerblue: {
          "100": "#4dabff",
          "200": "#1262af",
          "300": "#1262ae",
        },
        gainsboro: { "100": "#e0e0e0", "200": "rgba(226, 226, 226, 0.1)" },
        lavender: "#ccdcec",
        darkgray: "#999",
        yellowgreen: "#79ca00",
        sandybrown: "#ff9b53",
        lightgray: "#cecece",
        silver: "#bdbdbd",
        dimgray: "#616161",
        skyblue: "#99d2f5",
        "neon-green": "#B8FF43",
      },
      fontFamily: {
        rubik: "Rubik",
        "components-button-large": "Roboto",
        "baloo-bhai": "'Baloo Bhai'",
      },
    },
  },
  preflight: false,
} as Options;
