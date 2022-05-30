import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/abi.json"
import eth from "./utils/ethereum.png"
export default function App() {

 const [currentAccount, setCurrentAccount] = useState("");
const [xau,setXau] = useState(0);
  const [allWaves, setAllWaves] = useState([]);
  const [texto,setTexto] = useState("");
const contractAddress = "0xbB3541984c9dD6B38204C82CeE40Ce2185942977";
  
  const contractABI = abi.abi;

  const getAllWaves = async () =>{
    console.log("Entrou em getAllWaves");
    try {
      const {ethereum} = window;
      if (ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
       const signer = provider.getSigner();
       const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        let wavesCleaned = [];
        waves.forEach(
          
          wave => {
            wavesCleaned.push({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            });
          }
        );
         setAllWaves(wavesCleaned);
      }       
      else{
        console.log("O objeto Ethereum não existe!");
      }
    } catch (error) {
      
    }
    console.log(allWaves);
  }

  const setMsg = (e)=>{
   setTexto(e.target.value);
  }
  
 const checkIfWalletIsConnected = async () => {
   try {
     const { ethereum } = window;

     if (!ethereum) {
       console.log("Garanta que possua a Metamask instalada!");
       return;
     } else {
       console.log("Temos o objeto ethereum", ethereum);
     }

     const accounts = await ethereum.request({ method: "eth_accounts" });

     if (accounts.length !== 0) {
       const account = accounts[0];
       console.log("Encontrada a conta autorizada:", account);
       setCurrentAccount(account);
       getAllWaves();
     } else {
       console.log("Nenhuma conta autorizada foi encontrada")
     }
   } catch (error) {
     console.log(error);
   }
 }

 /**
 * Implemente aqui o seu método connectWallet
 */
 const connectWallet = async () => {
   try {
     const { ethereum } = window;

     if (!ethereum) {
       alert("MetaMask encontrada!");
       return;
     }

     const accounts = await ethereum.request({ method: "eth_requestAccounts" });

     console.log("Conectado", accounts[0]);
     setCurrentAccount(accounts[0]);
     
     const provider = new ethers.providers.Web3Provider(ethereum);
       const signer = provider.getSigner();
       const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

       let count = await wavePortalContract.getTotalWaves();
     setXau(count.toNumber());
   } catch (error) {
     console.log(error)
   }
 }

 useEffect(() => {
   setTexto("");
   checkIfWalletIsConnected();
   let wavePortalContract;

 const onNewWave = (from, timestamp, message) => {
   console.log("NewWave", from, timestamp, message);
   setAllWaves(prevState => [
     ...prevState,
     {
       address: from,
       timestamp: new Date(timestamp * 1000),
       message: message,
     },
   ]);
 };

 if (window.ethereum) {
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();

   wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
   wavePortalContract.on("NewWave", onNewWave);
 }

 return () => {
   if (wavePortalContract) {
     wavePortalContract.off("NewWave", onNewWave);
   }
 };
 }, [])

 const wave = async () => {
   try {
     const {ethereum}  = window;
     if(ethereum){
       const provider = new ethers.providers.Web3Provider(ethereum);
       const signer = provider.getSigner();
       const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

       let count = await wavePortalContract.getTotalWaves();
       console.log("Recuperando o numero de Xaus", count.toNumber());
      setXau(count.toNumber());
       const waveMsg = texto;
       
       const waveTxn = await wavePortalContract.wave(waveMsg, {gasLimit:300000});
       console.log("Minerando", waveTxn.hash);

       count = await wavePortalContract.getTotalWaves();
       console.log("Recuperando o numero de Xaus", count.toNumber());
       
      
     }
     else{
       console.log("Objeto Ethereum não encontrado!")
     }
   } catch (error) {
     console.log(error);
   }
 }

 return (
   <div className="container">

     <div className="dataContainer">
       <div className="header">
       ✨ Smart Messages!! 🧠
       </div>
      
     
       <div className="bio">
       Conecte sua carteira Ethereum wallet e me manda uma smartMessage!<br></br>
         
         Eu ja recebi {xau}
       </div>
          
          <textarea className="textArea" placeholder="O que você está pensando" type="text" id="msg" rows={4} onChange={setMsg} />        
       
       <button className="send" onClick={wave}>
         Enviar SmartMessage 🧠
       </button>
       {/*
       * Se não existir currentAccount, apresente este botão
       */}
       {!currentAccount && (
         <button className="send" onClick={connectWallet}>
           Conectar carteira
         </button>
       )}

       {allWaves.map((wave, index)=>{
     return(
       <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
             <div>Endereço: {wave.address}</div>
             <div>Data/Horário: {wave.timestamp.toString()}</div>
             <div>Mensagem: {wave.message}</div>
           </div>
     )
       }
                    )}
     </div>
   
   </div>
 );
}