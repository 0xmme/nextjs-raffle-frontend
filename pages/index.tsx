import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Smart Contract Raffle on Ethereum</title>
        <meta
          name="description"
          content="NextJS Frontend App for a raffle smart contract deployed on Rinkeby Ethereum."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
    </div>
  );
};

export default Home;
