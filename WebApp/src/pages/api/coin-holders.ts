import { ipfsToHttps } from '@/utils/link';
import type { NextApiRequest, NextApiResponse } from 'next'
import { query } from '@/backend/providers/db'
import { solveAccountType, solveAddressName, solveAddressImage } from '@/backend/solve'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = req.query.id;

  try {
    const holders = await query('COIN HOLDERS', `
	SELECT
		tb."Balance",
		a."Address",
		a."Kind",
		a."Type",
		a."Metadata",
		(
			SELECT jsonb_agg(jsonb_build_object(
				'name', "Domains"."Name",
				'lastLevel', "Domains"."LastLevel",
				'data', "Domains"."Data",
				'id', "Domains"."Id"
			)) FROM "Domains" WHERE "Domains"."Address" = a."Address"
		) as "domains"
	FROM "TokenBalances" AS tb
	INNER JOIN "Accounts" AS a ON a."Id" = tb."AccountId"
	WHERE tb."TokenId" = $1
	ORDER BY CAST(tb."Balance" AS DECIMAL) DESC
	LIMIT 5
	`, [id]);

	const holdersFormated = holders.map((holder) => {
		return ({
			balance: holder.Balance,
			account: {
				accountType: solveAccountType(holder.Type, holder.Kind),
				address: holder.Address,
				name: solveAddressName(holder.domains, null, null),
				image: ipfsToHttps(holder.metadata?.imageUri),
			}
		});
	});
    res.status(200).json(
		holdersFormated
	);
  } catch (err) {
    res.status(500).json({ error: err.toString() })
  }
}