import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/FGC-ICON.png" />
        <link rel="shortcut icon" type="image/png" href="/FGC-ICON.png" />
        <link rel="apple-touch-icon" type="image/png" href="/FGC-ICON.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
