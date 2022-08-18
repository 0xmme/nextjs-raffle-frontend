import { NextPage } from "next";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { parseEther } from "ethers/lib/utils";
import { contractAddresses, abi } from "../constants/index";
import {
  JSXElementConstructor,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { BigNumber, ethers } from "ethers";
import { IPosition, notifyType, useNotification } from "@web3uikit/core";

interface contractAddressesInterface {
  [key: string]: string[];
}

const RaffleEntrance: NextPage = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex!).toString();
  const addressArr: contractAddressesInterface = contractAddresses;
  const raffleAddress = chainId in addressArr ? addressArr[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");
  const dispatch = useNotification();

  const { runContractFunction: enterRaffle } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress!,
    functionName: "enterRaffle",
    params: {},
    msgValue: entranceFee,
  });

  const { runContractFunction: getEntranceFee, error: entranceFeeError } =
    useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress!,
      functionName: "getEntranceFee",
      params: {},
    });

  const { runContractFunction: performUpkeep, error: performUpkeepError } =
    useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress!,
      functionName: "performUpkeep",
      params: {},
    });

  async function updateUI() {
    const entranceFeeFromCall = (
      (await getEntranceFee()) as BigNumber
    ).toString();
    setEntranceFee(entranceFeeFromCall);
  }

  async function handleSuccess(tx) {
    console.log("success");
    await tx.wait(1);
    handleNewNotification("info", null, "topR");
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled]);

  return (
    <div className="p-5 flex flex-row">
      {entranceFee ? (
        <div className="px-4">
          <p className="pb-2">
            The entrance fee is {ethers.utils.formatUnits(entranceFee, "ether")}{" "}
            eth
          </p>
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
          >
            Enter Raffle
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () =>
              await performUpkeep({
                onError: (error) => {
                  console.log(error);
                },
              })
            }
          >
            perform upkeep
          </button>
        </div>
      ) : (
        <div>No Raffle contract detected!</div>
      )}
    </div>
  );
};

export default RaffleEntrance;
