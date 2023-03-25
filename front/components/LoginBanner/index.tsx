import { addressState } from "../../shared/state.ts";
import ConnectButton from "./ConnectButton.tsx";


export default function LoginBanner() {
    const address = addressState.value;
    return <div class="relative">
                <img class="object-cover absolute w-full z-0" src="/img/LoginBanner.png" alt="" />
                <div class="absolute w-full z-10 flex align-center justify-center text-center">
                    <div class="flex flex-col">
                        <p class="text-7xl font-rubik">Lynx Wallet</p>
                        <ConnectButton />
                    </div>
                </div>
        </div>
}