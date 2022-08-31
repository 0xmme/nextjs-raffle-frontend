import { NextPage } from "next";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { parseEther } from "ethers/lib/utils";
import { CONTRACT_ADDRESSES, ABI } from "../constants/index";
import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { IPosition, notifyType, useNotification } from "@web3uikit/core";

interface contractAddressesInterface {
  [key: string]: string[];
}

const RaffleEntrance: NextPage = () => {
  const { chainId: chainIdHex, isWeb3Enabled, web3 } = useMoralis();
  const chainId = parseInt(chainIdHex!).toString();
  const addressArr: contractAddressesInterface = CONTRACT_ADDRESSES;
  const raffleAddress = chainId in addressArr ? addressArr[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const [playerCount, setPlayerCount] = useState("0");
  const [recentWinner, setRecentWinner] = useState("0");
  const dispatch = useNotification();

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: ABI,
    contractAddress: raffleAddress!,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee, error: entranceFeeError } =
    useWeb3Contract({
      abi: ABI,
      contractAddress: raffleAddress!,
      functionName: "getEntranceFee",
      params: {},
    });

  const { runContractFunction: getPlayerCount, error: playerCountError } =
    useWeb3Contract({
      abi: ABI,
      contractAddress: raffleAddress!,
      functionName: "getPlayerCount",
      params: {},
    });

  const { runContractFunction: getRecentWinner, error: recentWinnerError } =
    useWeb3Contract({
      abi: ABI,
      contractAddress: raffleAddress!,
      functionName: "getRecentWinner",
      params: {},
    });

  async function updateUI() {
    const entranceFeeFromCall = (
      (await getEntranceFee()) as BigNumber
    ).toString();
    setEntranceFee(entranceFeeFromCall);
    const playerCountFromCall = (
      (await getPlayerCount()) as BigNumber
    ).toString();
    setPlayerCount(playerCountFromCall);
    const recentWinnerFromCall = (
      (await getRecentWinner()) as String
    ).toString();
    setRecentWinner(recentWinnerFromCall);
  }

  async function handleSuccess(tx) {
    console.log("success");
    await tx.wait(1);
    handleNewNotification("info", null, "topR");
    updateUI();
  }

  const handleNewNotification = function (
    type: notifyType,
    icon?: React.ReactElement,
    position?: IPosition
  ) {
    dispatch({
      type,
      message: "Transaction completed!",
      title: "Transaction Notification",
      icon,
      position: position || "topR",
    });
  };

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
      listenForWinnerToBePicked();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  // Event listeners
  async function listenForWinnerToBePicked() {
    const raffle = new ethers.Contract(raffleAddress!, ABI, web3);
    console.log("Waiting for a winner ...");
    await new Promise<void>((resolve, reject) => {
      raffle.once("WinnerPicked", async () => {
        console.log("We got a winner!");
        try {
          await updateUI();
          resolve();
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    });
  }

  return (
    <div className="p-5 flex flex-row">
      {entranceFee ? (
        <div className="px-4">
          <p className="pb-2">
            The entrance fee is {ethers.utils.formatUnits(entranceFee, "ether")}{" "}
            eth.
          </p>
          <p className="pb-2">The number of players is {playerCount}.</p>
          <p className="pb-2">The recent winner is {recentWinner}.</p>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () =>
              await enterRaffle({
                onSuccess: (results) => handleSuccess(results),
                onError: (error) => {
                  console.log(error);
                },
              })
            }
            disabled={isLoading || isFetching}
          >
            {isLoading || isFetching ? (
              <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
            ) : (
              <div>Enter Raffle</div>
            )}
          </button>
        </div>
      ) : (
        <div>No Raffle contract detected!</div>
      )}
    </div>
  );
};

export default RaffleEntrance;
