import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';

import certificateABI from './abi/certificate.json';
import cRecyABI from './abi/crecy.json';
import { MintCeloDto } from './dtos/celo/mint';
import { MintNftDto } from './dtos/polygon/mint-nft';

@Injectable()
export class Web3Service {
  constructor(
    @Inject('CeloWeb3') private readonly celoWeb3: Web3, // Celo instance
    @Inject('PolygonWeb3') private readonly polygonWeb3: Web3, // Polygon instance
    @Inject('Config')
    private readonly config: { wallet: string; privateKey: string },
  ) {}

  private getWeb3(network: 'celo' | 'polygon'): Web3 {
    return network === 'celo' ? this.celoWeb3 : this.polygonWeb3;
  }

  async owner() {
    const web3 = this.getWeb3('celo');

    const contract = new web3.eth.Contract(
      cRecyABI,
      process.env.CELO_CONTRACT_ADDRESS,
    );

    const owner = await contract.methods.owner().call();

    return owner;
  }

  // Polygon-specific method for minting NFTs
  async mintNFTPolygon(data: MintNftDto) {
    const { recipient, tokenURI } = data;
    const web3 = this.getWeb3('polygon'); // Always use Polygon Web3 for NFTs

    const contract = new web3.eth.Contract(
      certificateABI,
      process.env.POLYGON_CONTRACT_ADDRESS,
    );

    const nonce = await web3.eth.getTransactionCount(
      this.config.wallet,
      'latest',
    );

    const tx = {
      from: this.config.wallet,
      to: process.env.POLYGON_CONTRACT_ADDRESS,
      data: contract.methods.mintNFT(recipient, tokenURI).encodeABI(),
      nonce,
      gas: await contract.methods
        .mintNFT(recipient, tokenURI)
        .estimateGas({ from: this.config.wallet }),
      gasPrice: await web3.eth.getGasPrice(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      this.config.privateKey,
    );
    const result = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    return result.transactionHash;
  }

  // Celo-specific minting method (cRecy)
  async mintCelo(data: MintCeloDto) {
    const web3 = this.getWeb3('celo'); // Always use Celo Web3 for minting cRecy
    // Add your Celo-specific mint logic here

    console.log(data);
    return true;
  }
}
