import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/endpoints/providers/db';
import { getAssetSources } from '@/utils/link';
import { solveAccountType, solveAddressName } from './_solve';
import { ipfsToHttps } from '@/utils/link';


export default async function handler(
req: NextApiRequest,
res: NextApiResponse
) {
	const id = req.query.id;
	const limit = req.query.limit;
	const offset = req.query.offset;
	const address = <string>req.query.address;

	try {
		const tokens = await query('COLLECTION TOKENS', `
			SELECT
				token."Id" as tzkt_id,
				token."TokenId" as id,
				token."TotalSupply" as supply,
				token."HoldersCount" as holdersCount,
				jsonb_build_object(
					'address', tokenOwner."Address",
					'type', tokenOwner."Type",
					'kind', tokenOwner."Kind",
					'metadata', tokenOwner."Metadata",
					'domains', (
						SELECT jsonb_agg(jsonb_build_object(
							'name', "Domains"."Name",
							'lastLevel', "Domains"."LastLevel",
							'data', "Domains"."Data",
							'id', "Domains"."Id"
						)) FROM "Domains" WHERE "Domains"."Address" = tokenOwner."Address"
					)
				) as owner,
				token."Metadata" as metadata,
				COALESCE(token."Metadata"->>'thumbnailUri', token."Metadata"->>'displayUri', token."Metadata"->>'artifactUri') as image
			FROM
				"Tokens" as token
			LEFT JOIN
				"Accounts" as tokenOwner ON tokenOwner."Id" = token."OwnerId"
			WHERE
				token."ContractId" = $1
			ORDER BY
				CAST(token."TokenId" AS INTEGER)
			LIMIT $2
			OFFSET $3
		`, [id, limit, offset]);

		const promises = tokens?.map(async (token) => {
			token.image = getAssetSources(token.image, address, token.id);
			if (!token.owner.address) {
			  const newOwner = await query('TOKEN OWNER', `
				SELECT
				  owner."Address" as "address",
				  owner."Kind" as "kind",
				  owner."Type" as "type",
				  owner."Metadata" as "metadata",
				  (
					SELECT jsonb_agg(jsonb_build_object(
					  'name', "Domains"."Name",
					  'lastLevel', "Domains"."LastLevel",
					  'data', "Domains"."Data",
					  'id', "Domains"."Id"
					)) FROM "Domains" WHERE "Domains"."Address" = owner."Address"
				  ) as "domains"
				FROM
				  "TokenTransfers"
				LEFT JOIN
				  "Accounts" as owner ON owner."Id" = "TokenTransfers"."ToId"
				WHERE
				  "TokenTransfers"."TokenId" = $1
				ORDER BY
				  "TokenTransfers"."Id" DESC
			  `, [token.tzkt_id]);
			  if (newOwner && newOwner.length > 0) {
				token.owner = {
				  accountType: solveAccountType(newOwner[0].type, newOwner[0].kind),
				  address: newOwner[0].address,
				  name: solveAddressName(newOwner[0].domains, null, null),
				  image: ipfsToHttps(newOwner[0].metadata?.imageUri),
				};
			  }
			} else {
			  token.owner = {
				accountType: solveAccountType(token.owner.type, token.owner.kind),
				address: token.owner.address,
				name: solveAddressName(token.owner.domains, null, null),
				image: ipfsToHttps(token.owner.metadata?.imageUri),
			  };
			}
		  });
		  await Promise.all(promises);

		res.status(200).json({
			tokens
		});
	} catch (err) {
		res.status(500).json({ error: `Erreur du serveur ${err}` });
		console.error(err)
	}
}
