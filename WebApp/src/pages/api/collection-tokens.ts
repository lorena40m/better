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

		tokens?.forEach(token => {
			token.image = getAssetSources(token.image, address, token.id);
			token.owner = {
				accountType: solveAccountType(token.owner.type, token.owner.kind),
				address: token.owner.address,
				name: solveAddressName(token.owner.domains, null, null),
				image: ipfsToHttps(token.owner.metadata?.imageUri),
			}
		});

		res.status(200).json({
			tokens
		});
	} catch (err) {
		res.status(500).json({ error: `Erreur du serveur ${err}` });
		console.error(err)
	}
}
