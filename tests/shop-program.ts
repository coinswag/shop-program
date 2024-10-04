import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ShopProgram } from "../target/types/shop_program";
import { expect } from "chai";

describe("shop_program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ShopProgram as Program<ShopProgram>;
  const userWallet = anchor.web3.Keypair.generate();

  it("Creates a shop", async () => {
    const shopName = "Test Shop";

    // Derive PDA for the shop account
    const [shopPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("shop"), userWallet.publicKey.toBuffer(), Buffer.from(shopName)],
        program.programId
    );

    // Derive PDA for the user account
    const [userPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("user"), userWallet.publicKey.toBuffer()],
        program.programId
    );

    // Airdrop some SOL to the user wallet for transaction fees
    await provider.connection.requestAirdrop(userWallet.publicKey, 1000000000);

    // Create the shop
    await program.methods
        .createShop(shopName)
        .accounts({
          shop: shopPda,
          user: userWallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([userWallet])
        .rpc();

    // Fetch the created shop account
    const shopAccount = await program.account.shop.fetch(shopPda);

    // Verify the shop account data
    expect(shopAccount.owner.toString()).to.equal(userWallet.publicKey.toString());
    expect(shopAccount.name).to.equal(shopName);
    expect(shopAccount.createdAt.toNumber()).to.be.greaterThan(0);

    // Fetch the user account
    const userAccount = await program.account.user.fetch(userPda);

    // Verify the user account data
    expect(userAccount.shopCount.toNumber()).to.equal(1);
  });
});