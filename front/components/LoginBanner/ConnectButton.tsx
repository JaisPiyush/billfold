import { getProvider } from "../../shared/hooks/metamask.ts";
import {addressState} from "../../shared/state.ts";

export default function ConnectButton() {

    const onClick = async () => {
        const ethereum = getProvider();
        if(ethereum === undefined) return;
        await ethereum.request({
            method: 'eth_requestAccounts',
            params: []
        });
        addressState.value = ethereum.selectedAddress;
    }

    return (
        <button onClick={onClick} class="hover:bg-gray-200 bg-neon-green text-gray-200 hover:text-neon-green rounded-full">
            <p class="cursor-pointer  text-lg font-rubik font-semibold">CONNECT</p>
        </button>
    );
}