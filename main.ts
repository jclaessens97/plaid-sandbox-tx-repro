import { PlaidApi, Configuration, PlaidEnvironments, Products } from "plaid";
import plaidSandboxTransactions from './plaid_sandbox_transactions.json';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.APP_PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.APP_PLAID_SECRET,
      },
    },
  }),
);

async function createSandboxPublicToken() {
  const response = await plaidClient.sandboxPublicTokenCreate({
    institution_id: 'ins_109508',
    initial_products: [Products.Auth, Products.Transactions],
    options: {
      override_username: 'user_custom',
      override_password: JSON.stringify({
        ...plaidSandboxTransactions,
      }),
    },
  });
  return response.data.public_token;
}


async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data;
}

(async () => {
  const publicToken = await createSandboxPublicToken();
  const { access_token } = await exchangePublicToken(publicToken);
  const response = await plaidClient.transactionsSync({
    access_token,
  });

  // Expect added to be containint 2 transactions, since we added 2 transactions in the sandbox?
  // Sometimes it has 2, but most of the times it has 0.
  console.log(response.data);
})();
