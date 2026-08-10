# Compresso

Compresso is a fast, privacy-first image optimizer. Compress and convert
images — one at a time or in bulk — using modern codecs (MozJPEG, WebP, AVIF,
JPEG XL, OxiPNG and more), entirely in your browser.

# Privacy

Compresso does not send your images to a server. All image compression happens
locally on your device.

The hosted build may use privacy-respecting, aggregate analytics to count
visits and record before/after file sizes. No image data is ever transmitted.

# Developing

1. Clone the repository.
1. Install dependencies:
   ```sh
   npm install
   ```
1. Build the app:
   ```sh
   npm run build
   ```
1. Start the development server:
   ```sh
   npm run dev
   ```

# Contributing

Contributions are welcome. See the [contribute guide](/CONTRIBUTING.md).

# Credits

Compresso is built on the open-source [Squoosh] project by the Google Chrome
team, used under the Apache 2.0 License. See [LICENSE](/LICENSE) for details.

[squoosh]: https://github.com/GoogleChromeLabs/squoosh
