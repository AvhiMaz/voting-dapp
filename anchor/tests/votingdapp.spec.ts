import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { Votingdapp } from "../target/types/votingdapp";

const IDL = require("../target/idl/votingdapp.json");

const votingAddress = new PublicKey(
  "coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF"
);

describe("votingdapp", () => {
  let context;
  let provider;
  let votingProgram: anchor.Program<Votingdapp>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "votingdapp", programId: votingAddress }],
      []
    );

    provider = new BankrunProvider(context);

    votingProgram = new Program<Votingdapp>(IDL, provider);
  });

  it("Initialize Votingdapp", async () => {
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "What is your favorite team?",
        new anchor.BN(0),
        new anchor.BN(1821246480)
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log("Poll+++++++++++++", poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("What is your favorite team?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  it("Initialize Candidates", async () => {
    await votingProgram.methods
      .initializeCandidates("India", new anchor.BN(1))
      .rpc();
    await votingProgram.methods
      .initializeCandidates("Nz", new anchor.BN(1))
      .rpc();

    const [indiaAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("India")],
      votingAddress
    );

    const indiaCandidates = await votingProgram.account.candidate.fetch(
      indiaAddress
    );
    console.log("India Candidates+++++++++++++", indiaCandidates);

    expect(indiaCandidates.candidateVote.toNumber()).toEqual(0);

    const [nzAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Nz")],
      votingAddress
    );

    const nzCandidates = await votingProgram.account.candidate.fetch(nzAddress);

    console.log("Nz Candidates+++++++++++++", nzCandidates);
    expect(nzCandidates.candidateVote.toNumber()).toEqual(0);
  });
});
