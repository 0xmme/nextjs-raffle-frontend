import { NextPage } from "next";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { parseEther } from "ethers/lib/utils";
import { contractAddresses, abi } from "../constants/index";
import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";

interface contractAddressesInterface {
  [key: string]: string[];
}

const RaffleEntrance: NextPage = () => {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex!).toString();
  const addressArr: contractAddressesInterface = contractAddresses;
  const raffleAddress = chainId in addressArr ? addressArr[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0");

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
  entranceFeeError ? console.log(entranceFeeError) : null;

  async function updateUI() {
    const entranceFeeFromCall = (
      (await getEntranceFee()) as BigNumber
    ).toString();
    setEntranceFee(ethers.utils.formatUnits(entranceFeeFromCall, "ether"));
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  return <div className="py-5">Entrance fee is {entranceFee} eth</div>;
};

export default RaffleEntrance;
