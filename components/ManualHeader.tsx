import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";
import { useEffect } from "react";

const ManualHeader: NextPage = () => {
  const {
    enableWeb3,
    deactivateWeb3,
    account,
    isWeb3Enabled,
    isWeb3EnableLoading,
    Moralis,
  } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account: any) => {
      console.log(`account changed to $(account)`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null Account found");
      }
    });
  }, []);

  return (
    <div>
      <h1>Welcome to the Raffle!</h1>
      <br />
      {account ? (
        <div>
          {account.slice(0, 6)}
          ...
          {account.slice(account.length - 4)} connected!
        </div>
      ) : (
        <button
          onClick={async () => {
            await enableWeb3();
            if (typeof window !== "undefined") {
              window.localStorage.setItem("connected", "injected");
            }
          }}
          disabled={isWeb3EnableLoading}
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default ManualHeader;
