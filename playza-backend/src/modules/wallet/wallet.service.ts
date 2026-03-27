import { supabaseAdmin } from '../../config/supabase'
import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!

export async function getWallet(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('wallets')
    .select('balance, total_deposited, total_withdrawn')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function initializeDeposit(userId: string, amount: number, email: string, currency = 'NGN') {
  if (amount < 100) throw new Error('Minimum deposit is ₦100')

  const reference = `PLZ-DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      currency,
      metadata: { user_id: userId },
      callback_url: `${process.env.FRONTEND_URL?.split(',')[0]}/wallet?deposit=success`,
    }),
  })

  const result = await response.json()
  if (!result.status) throw new Error(result.message)

  await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    type: 'deposit',
    amount,
    status: 'pending',
    reference,
  })

  return {
    authorization_url: result.data.authorization_url,
    reference,
    amount,
  }
}

export async function verifyDeposit(reference: string) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })

  const result = await response.json()
  if (!result.status || result.data.status !== 'success') {
    throw new Error('Payment not successful')
  }

  const { data: existingTxn } = await supabaseAdmin
    .from('transactions')
    .select('id, status, user_id, amount')
    .eq('reference', reference)
    .single()

  if (!existingTxn) throw new Error('Transaction not found')
  if (existingTxn.status === 'successful') return { message: 'Already processed' }

  await supabaseAdmin
    .from('transactions')
    .update({ status: 'successful' })
    .eq('reference', reference)

  const amount = result.data.amount / 100

  await supabaseAdmin.rpc('increment_wallet_balance', {
    p_user_id: existingTxn.user_id,
    p_amount: amount,
  })

  return { message: 'Deposit successful', amount }
}

export async function paystackWebhook(payload: any, signature: string) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex')

  if (hash !== signature) throw new Error('Invalid signature')

  if (payload.event === 'charge.success') {
    const reference = payload.data.reference
    await verifyDeposit(reference)
  }

  return { received: true }
}

export async function requestWithdrawal(userId: string, amount: number, bankCode: string, accountNumber: string, accountName: string) {
  if (amount < 500) throw new Error('Minimum withdrawal is ₦500')

  const { data: wallet } = await supabaseAdmin
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!wallet || wallet.balance < amount) throw new Error('Insufficient balance')

  const reference = `PLZ-WIT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

  await supabaseAdmin.from('transactions').insert({
    user_id: userId,
    type: 'withdrawal',
    amount,
    status: 'pending',
    reference,
    meta: { bank_code: bankCode, account_number: accountNumber, account_name: accountName },
  })

  await supabaseAdmin.rpc('decrement_wallet_balance', {
    p_user_id: userId,
    p_amount: amount,
  })

  return { message: 'Withdrawal request submitted', reference }
}

export async function getTransactionHistory(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('transactions')
    .select('id, type, amount, status, reference, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error

  return {
    transactions: data,
    total: count ?? 0,
    page,
    limit,
    total_pages: Math.ceil((count ?? 0) / limit),
  }
}

export async function verifyBankAccount(accountNumber: string, bankCode: string) {
  const response = await fetch(
    `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  )
  const result = await response.json()
  if (!result.status) throw new Error('Could not verify account')
  return { account_name: result.data.account_name, account_number: result.data.account_number }
}

export async function getBankList() {
  const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })
  const result = await response.json()
  if (!result.status) throw new Error('Could not fetch banks')
  return result.data.map((b: any) => ({ name: b.name, code: b.code }))
}
