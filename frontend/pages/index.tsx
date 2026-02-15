import Head from "next/head";
import VideoDownloader from "../src/components/VideoDownloader";

export default function Home() {
  return (
    <>
      <Head>
        <title>YouTube Downloader</title>
        <meta
          name="description"
          content="Download videos from YouTube quickly and easily"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <VideoDownloader />
    </>
  );
}
