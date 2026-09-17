export const BOB_MORDIMUS_RESET = {
  "scene": {
    "id": "z8wkbcziQufR7jWG",
    "names": [
      "Arudora Isle",
      "阿鲁多拉岛 Arudora Isle"
    ],
    "folder": "zW1wwVPuezvJOakv",
    "width": 36000,
    "height": 48000
  },
  "actor": {
    "id": "ZixxJrXEmD4voY9g",
    "names": [
      "Aron Mordimus",
      "阿隆·莫迪穆斯 Aron Mordimus"
    ],
    "type": "npc",
    "folder": "h8uOhq5XwRdjsNhg",
    "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.ZixxJrXEmD4voY9g"
  },
  "token": {
    "id": "ZixxJrXEmD4voY9g",
    "actorId": "ZixxJrXEmD4voY9g",
    "actorLink": false,
    "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/PhantomAronMordimus.webp",
    "level": "qK43OmiuYSvxf4zO",
    "names": [
      "Wolf's Victim",
      "狼口下的受害者 Wolf's Victim",
      "Aron Mordimus",
      "阿隆·莫迪穆斯 Aron Mordimus"
    ]
  },
  "reset": {
    "sourceName": "Wolf's Victim",
    "approvedName": "狼口下的受害者 Wolf's Victim",
    "x": 17200,
    "y": 44800
  },
  "nativeMethodSource": "async modifyDocumentBatch(operations) {\n\n    // Sanity check\n    if ( !operations.length ) return [];\n    const isRealDryRun = operations.every(o => o.dryRun);\n    if ( isRealDryRun !== operations.some(o => o.dryRun) ) {\n      throw new Error(\"Either all or none of a batch request's operations must be dry runs.\");\n    }\n\n    /** @type {DatabaseWriteOperation[]} */\n    const requests = [];\n    for ( const operation of operations ) {\n      operation.dryRun = true;\n      const documentClass = getDocumentClass$1(operation.documentName);\n      switch ( operation.action ) {\n        case \"create\": {\n          await documentClass.createDocuments(operation.data, operation);\n          if ( !operation.data.length || isRealDryRun ) continue;\n          const request = ClientDatabaseBackend.#buildRequest(documentClass, operation.action, operation);\n          requests.push(request);\n          break;\n        }\n        case \"update\": {\n          await documentClass.updateDocuments(operation.updates, operation);\n          if ( !operation.updates.length || isRealDryRun ) continue;\n          const request = ClientDatabaseBackend.#buildRequest(documentClass, operation.action, operation);\n          requests.push(request);\n          break;\n        }\n        case \"delete\": {\n          await documentClass.deleteDocuments(operation.ids, operation);\n          if ( !operation.ids.length || isRealDryRun ) continue;\n          const request = ClientDatabaseBackend.#buildRequest(documentClass, operation.action, operation);\n          requests.push(request);\n          break;\n        }\n        default: {\n          const message = operation.action\n            ? `Invalid Document modification action \"${operation.action}\" provided`\n            : \"No action provided for constituent operation of batch modification\";\n          throw new Error(message);\n        }\n      }\n      if ( !isRealDryRun ) delete operation.dryRun;\n    }\n    if ( !requests.length ) return [];\n    const response = await SocketInterface.dispatch(\"modifyDocumentBatch\", requests);\n    const results = response.results.map(r => new foundry.abstract.DocumentSocketResponse(r));\n    return this.#handleModifyDocumentBatch(results);\n  }",
  "provenance": {
    "rawSha256": "6e56f70a6e23a88eea2d85af2d18459e7f5faa2786dcc53def112bd5ffa75564",
    "nativeBackendSha256": "8ffe114bca601980bf2f4582ce1f6e27c555d76586470f1a16ac23f6f021b9c5",
    "canonicalRecords": {
      "scenes[0].name": "10f747f79cef539b6b3e9da4114640e62b2830ac301f4786217f37bd5aef8d34",
      "scenes[0].tokens[105].name": "e8f30132e719135d56dbe250486ae971414e36d811076f5577ab7467e598b354",
      "actors[321].name": "0f7d5f8bb50393d023b94091c7ad31917cdca32dfcab0925329798b8fe83ef51"
    },
    "servedBackendBundleSha256": "c90618840274e7db98564eac9e96778b1acc6f62aef3a59a460e6c8708393829",
    "servedBackendMethodLines": [
      81412,
      81461
    ]
  }
};
