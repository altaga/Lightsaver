use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo,
    account_info::next_account_info,
    program_error::ProgramError,
    program::invoke_signed,
    sysvar::{rent::Rent, Sysvar},
    system_instruction::{create_account},
    borsh0_10::try_from_slice_unchecked
};

// Transactions Data Processing

#[derive(Debug)]
pub struct TransactionData {
    bump:u8,
    seed:String,
    amount:u64,
    concept:String
}

#[derive(BorshDeserialize)]
pub struct TransactionDataBorsh {
    instruction:u8,
    bump:u8,
    seed:String,
    amount:u64,
    concept:String
}

pub fn create_transaction_data(payload:TransactionDataBorsh) -> TransactionData{
    TransactionData {
        bump:payload.bump,
        seed:payload.seed,
        amount: payload.amount,
        concept: payload.concept
    }
}

// Create Card Processing

#[derive(Debug)]
pub struct CreateData {
    bump:u8,
    space:u8,
    seed:String,
    nfc:u8,
    types:String,
    kind:String
}

#[derive(BorshDeserialize)]
pub struct CreateDataBorsh {
    instruction:u8,
    bump:u8,
    space:u8,
    seed:String,
    nfc:u8,
    types:String,
    kind:String
}

pub fn create_creation_data(payload:CreateDataBorsh) -> CreateData{
    CreateData {
        bump:payload.bump,
        space:payload.space,
        seed:payload.seed,
        nfc:payload.nfc,
        types:payload.types,
        kind:payload.kind
    }
}

// Card PDA Data

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct CardPDADataBorsh {
    pub nfc:u8,
    pub types:String,
    pub kind:String
}

// Card Enum Settings

pub enum CardInstruction {
    AddFunds(TransactionData),
    Contactless(TransactionData),
    Purchase(TransactionData),
    Refund(TransactionData),
    CreateCard(CreateData),
    ChangeInfo(CreateData)
}

impl CardInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let selector = input[0];
        Ok(match selector {
            0 => {
                Self::AddFunds(create_transaction_data(TransactionDataBorsh::try_from_slice(input).unwrap()))
            },
            1 => {
                Self::Contactless(create_transaction_data(TransactionDataBorsh::try_from_slice(input).unwrap()))
            },
            2 => {
                Self::Purchase(create_transaction_data(TransactionDataBorsh::try_from_slice(input).unwrap()))
            },
            3 => {
                Self::Refund(create_transaction_data(TransactionDataBorsh::try_from_slice(input).unwrap()))
            },
            4=> {
                 Self::CreateCard(create_creation_data(CreateDataBorsh::try_from_slice(input).unwrap()))
            },
            5 =>{
                Self::ChangeInfo(create_creation_data(CreateDataBorsh::try_from_slice(input).unwrap()))
            }
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}

// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Entry Point

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;

    if !payer_account_info.is_signer {
        return Err(ProgramError::IllegalOwner);
    }
    
    let instruction = CardInstruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        CardInstruction::AddFunds(x) => {
            //msg!("Add Funds {:?}", x)
            msg!("Add Funds")
        },
        CardInstruction::Contactless(x) => {
             msg!("Contactless Transaction");
             contactless_from_card(program_id, accounts, x)?;
        },
        CardInstruction::Purchase(x) => {
            msg!("Purchase Transaction");
            transfer_from_card(program_id, accounts, x)?;
        },
        CardInstruction::Refund(x) => {
             msg!("Refund")
        },
        CardInstruction::CreateCard(x) =>{
            msg!("Create Card with data: {:?}", x);
            create_card(program_id, accounts, x)?;
        },
        CardInstruction::ChangeInfo(x)=>{
            msg!("Change Card with data: {:?}", x);
            change_card(program_id, accounts, x)?;
        },
    }
    Ok(())
}

// Contactless from Card

fn contactless_from_card(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: TransactionData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let to_account_info = next_account_info(account_info_iter)?;

    // find space and minimum rent required for account
    let bump = &data.bump;
    let seed = &data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    let card_data = try_from_slice_unchecked::<CardPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    if card_data.nfc > 0 {
        // Does the from account have enough lamports to transfer?
        if **pda_account_info.try_borrow_lamports()? < data.amount {
            return Err(ProgramError::InsufficientFunds);
        }
        // Debit from_account and credit to_account
        **pda_account_info.try_borrow_mut_lamports()? -= data.amount;
        **to_account_info.try_borrow_mut_lamports()? += data.amount;
        Ok(())
    }
    else{
        return Err(ProgramError::InvalidAccountData);
    }
}

// Transfer from Card

fn transfer_from_card(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: TransactionData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let to_account_info = next_account_info(account_info_iter)?;

    // find space and minimum rent required for account
    let bump = &data.bump;
    let seed = &data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    // Does the from account have enough lamports to transfer?
    if **pda_account_info.try_borrow_lamports()? < data.amount {
        return Err(ProgramError::InsufficientFunds);
    }
    // Debit from_account and credit to_account
    **pda_account_info.try_borrow_mut_lamports()? -= data.amount;
    **to_account_info.try_borrow_mut_lamports()? += data.amount;

    Ok(())
}

// Create Card

fn create_card(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: CreateData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;
    let system_program = next_account_info(account_info_iter)?;
    // find space and minimum rent required for account
    let _space = data.space;
    let bump = data.bump;
    let seed = data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    let rent_lamports = rent_sysvar_account_info.minimum_balance(_space.into());

    invoke_signed(
        &create_account(
            &payer_account_info.key,
            &pda_account_info.key,
            rent_lamports,
            _space.into(),
            program_id
        ),
        &[
            payer_account_info.clone(),
            pda_account_info.clone(),
            system_program.clone(),
        ],
         &[signers_seeds],
    )?;

    msg!("unpacking state account");
    let mut card_data = try_from_slice_unchecked::<CardPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    msg!("{:?}", card_data);

    card_data.kind = data.kind;
    card_data.nfc= data.nfc;
    card_data.types = data.types;

    msg!("{:?}", card_data);
    card_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}

// Get info - Read Cost

fn change_card(
    program_id: &Pubkey,
    accounts: &[AccountInfo], 
    data: CreateData
) -> ProgramResult {

    let account_info_iter = &mut accounts.iter();
    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    // find space and minimum rent required for account
    let _space = data.space;
    let bump = data.bump;
    let seed = data.seed;

    let signers_seeds: &[&[u8]; 3] = &[
        seed.as_bytes(),
        &payer_account_info.key.to_bytes(),
        &[bump.clone()],
    ];

    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account_info.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    msg!("unpacking state account");
    let mut card_data = try_from_slice_unchecked::<CardPDADataBorsh>(&pda_account_info.data.borrow()).unwrap();

    msg!("{:?}", card_data);

    card_data.kind = data.kind;
    card_data.nfc= data.nfc;
    card_data.types = data.types;

    msg!("{:?}", card_data);
    card_data.serialize(&mut &mut pda_account_info.data.borrow_mut()[..])?;

    Ok(())
}