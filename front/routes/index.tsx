import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";
import LoginView from "../islands/LoginView.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/global.css" />
        <title>Lynx Wallet</title>
      </Head>
      <body class="p-0 m-0 w-screen text-white font-rubik h-screen bg-gray-200 flex flex-row justify-center">
        <div class="h-full w-full max-w-5xl  flex flex-col">
          <div class="h-16 w-full">01</div>
          <div class="h-full w-full">
            <LoginView />
          </div>
        </div>
      </body>
    </>
  );
}
