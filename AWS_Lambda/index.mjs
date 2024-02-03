import ethers from "ethers";
import { icardABI } from "./icard.js";

const privateKey = process.env.NODE_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider(
  "https://replicator.phoenix.lightlink.io/rpc/v1"
);
const walletWithProvider = new ethers.Wallet(privateKey, provider);

export const handler = async (event) => {
  let eventBody = JSON.parse(event.body);
  if (eventBody.currency === "USD") {
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: {
          result: "success",
        },
      }),
    };
    return response;
  } else if (eventBody.currency === "ETH") {
    const contract = new ethers.Contract(
      eventBody.addressCard,
      icardABI,
      walletWithProvider
    );
    const tx = await contract.transferNative(
      ethers.utils.parseUnits(eventBody.amount.toString(), 18).toHexString(),
      eventBody.address,
    );
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        tx: tx.hash,
        result: "success",
      }),
    };
    return response;
  }
};