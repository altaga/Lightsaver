import { Connection, Keypair, PublicKey, Struct, SystemProgram, Transaction, TransactionInstruction, clusterApiUrl, sendAndConfirmTransaction } from "@solana/web3.js";
import fetch from "node-fetch";
import bs58 from "bs58";
import { serialize } from "borsh";

let CardInstruction = {
  AddFunds: 0,
  Contactless: 1,
  Purchase: 2,
  Refund: 3,
  CreateCard: 4,
  ChangeInfo: 5,
};

const payloadSchema = { struct: { ci: 'u8', bump: 'u8', seed: "string", amount: 'u64', concept: 'string' } };

// program id
const programId = new PublicKey("EkWTygacDNd3pTsUyJd7L6AwSsu8gP5sEVyYYvTNKyqE");

async function fetchPrivateKey(url, cardHash) {
  return new Promise((resolve, reject) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      cardHash,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(url, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch((error) => reject(error));
  });
}

export const handler = async (event) => {
  // Solana Connection
  const connection = new Connection(
    clusterApiUrl("devnet"),
    "confirmed"
  );
  const body = JSON.parse(event["body"]);
  let privatekey = await fetchPrivateKey(
    "https://lf2w3laarl.execute-api.us-east-1.amazonaws.com/get-db-card",
    body.cardHash
  );
  if (privatekey.length > 0) {
    const myPrivateKey = privatekey[0].privateKey;
    let keypair = Keypair.fromSecretKey(bs58.decode(myPrivateKey));
    const feePayer = keypair;
    const seed = privatekey[0].seed;
    let [pda, bump] = await PublicKey.findProgramAddressSync(
      [Buffer.from(seed), feePayer.publicKey.toBuffer()],
      programId
    );

    const kind = CardInstruction.Purchase;

    const instruction = {
      ci: kind,
      bump,
      seed,
      amount: body.amount, // 0.1 SOL
      concept: "Add Funds",
    };

    const encoded = serialize(payloadSchema, instruction);

    const data = Buffer.from(encoded);

    let tx = new Transaction().add(
      new TransactionInstruction({
        keys: [
          {
            pubkey: feePayer.publicKey, // Signer
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: pda, // FROM
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: new PublicKey(body.to), // To
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: SystemProgram.programId, // Program
            isSigner: false,
            isWritable: false,
          },
        ],
        data,
        programId,
      })
    );

    // Send Solana Transaction
    const transactionSignature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(tx),
      [feePayer]
    );

    // to be done
    const response = {
      statusCode: 200,
      body: `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
    };
    return response;
  } else {
    const response = {
      statusCode: 200,
      body: "No card found",
    };
    return response;
  }
};
