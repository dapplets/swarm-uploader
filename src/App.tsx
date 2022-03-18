import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as ethers from 'ethers';
import abi from './abi.json';


interface P {

}

interface S {
  file: File | null | undefined;
  chunks: number;
  depth: number;
  ttl: number;
  initialBalancePerChunk: any;
  totalAmount: any;
}

class App extends React.Component<P, S> {
  constructor(p: P) {
    super(p);

    this.state = {
      file: null,
      chunks: 0,
      depth: 0,
      ttl: 31536000,
      initialBalancePerChunk: null,
      totalAmount: null
    }
  }

  async recalculate() {
    const { file, ttl } = this.state;

    if (file === null || file === undefined) return;

    const { size } = file;

    const chunks = Math.ceil(size / 4096);
    let depth = Math.ceil(Math.log2(chunks));
    if (depth < 17) depth = 17;

    const provider = new ethers.providers.JsonRpcProvider('https://goerli.mooo.com/', 5);
    const contract = new ethers.Contract('0x621e455c4a139f5c4e4a8122ce55dc21630769e4', abi, provider);
    // const provider = new ethers.providers.JsonRpcProvider('https://dai.poa.network/', 100);
    // const contract = new ethers.Contract('0x6a1A21ECA3aB28BE85C7Ba22b2d6eAE5907c900E', abi, provider);

    // const cumulativePayout = await contract.currentTotalOutPayment();
    const pricePerBlock = await contract.lastPrice();

    console.log(`Price per block: ${pricePerBlock.toString()} PLUR / block`);

    const blockTime = 15;

    const postageStampChunks = 2 ** depth;
    
    const initialBalancePerChunk = pricePerBlock.mul(ttl).div(blockTime);

    const totalAmount = initialBalancePerChunk.mul(postageStampChunks);

    this.setState({ chunks, depth, initialBalancePerChunk, totalAmount });
  }

  render() {

    const s = this.state;

    return <div style={{ padding: 20 }}>
      <input type="file" onChange={(e) => {
        this.setState({ file: e.target.files?.[0] }, () => this.recalculate());
      }} />

      <br/>

      TTL: <input type="number"
        value={s.ttl}
        onChange={(e) => {
          this.setState({ ttl: Number(e.target.value) }, () => this.recalculate());
        }} /> seconds

      <div>Name: {s.file?.name}</div>
      <div>Size: {s.file?.size} bytes = {(s.file?.size ?? 0) / 1024} KB = {(s.file?.size ?? 0) / 1024 / 1024} MB</div>
      <div>Type: {s.file?.type}</div>
      <div>Chunks: {s.chunks}</div>
      <div>Depth: {s.depth}</div>
      <div>TTL: {s.ttl} seconds = {s.ttl / 60} minutes = {s.ttl / 60 / 60} hours = {s.ttl / 60 / 60 / 24} days = {s.ttl / 60 / 60 / 24 / 365} years</div>
      <div>Initial balance per chunk: {s.initialBalancePerChunk?.toString()}</div>
      <div>Stamp BZZ: {s.totalAmount ? ethers.utils.formatUnits(s.totalAmount, 16) : 0} BZZ = {s.totalAmount?.toString()} PLUR</div>
    </div>
  }
}

export default App;
