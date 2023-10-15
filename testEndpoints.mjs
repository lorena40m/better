import ArtifactEndpoint from './SymbolicArtifactEndpoint.mjs'

function log(response) {
    console.log(JSON.stringify(response, null, 2))
}

function assertArtifactType(response, expected) {
    console.assert(response.artifactType === expected, `❌ Should be a ${expected} artifact`)
}

let id, response

id = 'tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'wallet')

id = 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'coin')

id = 'KT1Q71TpT9Y6UGLx4EnKoLe4duTLzmoePQCA'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'collection')

id = 'KT1GbyoDi7H1sfXmimXpptZJuCdHMh66WS9u'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'contract')

id = 'onmTvDE13EZ1NAC3GSbxp7yEhXRk7tNaEFDyX4hg1AXvrnwye57'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'call')

id = 'opH7gHRCDgGKZf6T3wCjvAzn9uRWrs2sbdFzUjVsjM14MGKfcwd'
response = await ArtifactEndpoint({ id })
log(response)
assertArtifactType(response, 'transfer')
