use anchor_lang::prelude::*;

declare_id!("dtKYr6vLWQR4kYJxRcoFfqv3PtXAtEyZDLJVqzyDwRU");

#[program]
pub mod shop_program {
    use super::*;

    pub fn create_shop(ctx: Context<CreateShop>, shop_name: String) -> Result<()> {
        let shop = &mut ctx.accounts.shop;

        shop.owner = ctx.accounts.user.key();
        shop.name = shop_name;
        shop.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(shop_name: String)]
pub struct CreateShop<'info> {
    #[account(
        init,
        payer = user,
        space = Shop::LEN,
        seeds = [b"shop", user.key().as_ref(), shop_name.as_bytes()],
        bump
    )]
    pub shop: Account<'info, Shop>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Shop {
    pub owner: Pubkey,
    pub name: String,
    pub created_at: i64,
}

impl Shop {
    pub const LEN: usize = 8 + 32 + 4 + 64 + 8; // discriminator + pubkey + string prefix + max name length + timestamp
}