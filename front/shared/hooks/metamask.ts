// import MetaMaskSDK from "@metamask/sdk";
import { useState, useEffect } from "preact/hooks";

export function getProvider() {
  return (window as any).ethereum;
}

export const useGetMetaMaskAddress = () => {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const ethereum = getProvider();
  useEffect(() => {
    if (ethereum !== undefined) {
      setAddress(ethereum.selectedAddress as string | undefined);
    }
  }, [ethereum, ethereum.selectedAddress]);
  return [address, ethereum];
};
