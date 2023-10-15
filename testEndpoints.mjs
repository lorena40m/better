import ArtifactEndpoint from './SymbolicArtifactEndpoint.mjs'

function assertArtifactType(response, expected) {
    console.assert(response.type === expected, `❌ Should be a ${expected} artifact`)
}

let id, response

id = 'tz1YQqEDkFQCTHz5pRLLsKt9532ELtc8FcpX'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'wallet')

id = 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'coin')

id = 'KT1Q71TpT9Y6UGLx4EnKoLe4duTLzmoePQCA'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'collection')

id = 'KT1UN1vQ9dt2pz1vALnkisn8z1NqPjr7cXfS'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'contract')

id = 'onmTvDE13EZ1NAC3GSbxp7yEhXRk7tNaEFDyX4hg1AXvrnwye57'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'call')

id = 'opH7gHRCDgGKZf6T3wCjvAzn9uRWrs2sbdFzUjVsjM14MGKfcwd'
response = await ArtifactEndpoint({ id })
console.log(response)
assertArtifactType(response, 'transfer')
