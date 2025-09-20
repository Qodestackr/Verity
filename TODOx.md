BUSINESS RELATIONSHIPS/NETWORK:

/api/relationships POST

```json
{
  "organizationId": "cmawf1qp20000smvztmb3vys4",
  "targetId": "cmawp8j5j0000smmc6ueq7wtx",
  "type": "GENERAL",
  "permissions": [
    {
      "permissionType": "VIEW_PRODUCTS",
      "isGranted": true,
      "scope": "ALL"
    },
    {
      "permissionType": "VIEW_PRICES",
      "isGranted": false,
      "scope": "NONE"
    }
  ],
  "notes": "Looking to build a strong partnership"
}
```

RETURNED:

```json
{
  "id": "cmay6ukzv0001smegx5yj5rh2",
  "requesterId": "cmawf1qp20000smvztmb3vys4",
  "targetId": "cmawp8j5j0000smmc6ueq7wtx",
  "status": "PENDING",
  "type": "GENERAL",
  "createdAt": "2025-05-21T16:59:48.043Z",
  "updatedAt": "2025-05-21T16:59:48.043Z",
  "lastInteractionAt": null,
  "notes": "Looking to build a strong partnership"
}
```

/api/relationships GET

PARAMS:
organizationId: cmawf1qp20000smvztmb3vys4 (your org ID)
status: ACTIVE (optional)
type: PARTNER (optional)

http://localhost:3000/api/relationships?organizationId=cmawf1qp20000smvztmb3vys4&status=PENDING&type=GENERAL

RETURNS:

```json
[
  {
    "id": "cmay6ukzv0001smegx5yj5rh2",
    "partnerId": "cmawp8j5j0000smmc6ueq7wtx",
    "partnerName": "Marny Potter's Organization",
    "partnerLogo": null,
    "partnerBusinessType": "DISTRIBUTOR",
    "partnerLocation": null,
    "status": "PENDING",
    "type": "GENERAL",
    "direction": "outgoing",
    "createdAt": "2025-05-21T16:59:48.043Z",
    "updatedAt": "2025-05-21T16:59:48.043Z",
    "lastInteractionAt": null,
    "notes": "Looking to build a strong partnership",
    "permissions": [
      {
        "id": "cmay6ulsc0005smegd89xhffn",
        "relationshipId": "cmay6ukzv0001smegx5yj5rh2",
        "permissionType": "VIEW_PRODUCTS",
        "isGranted": true,
        "scope": "ALL",
        "scopeIds": [],
        "createdAt": "2025-05-21T16:59:49.068Z",
        "updatedAt": "2025-05-21T16:59:49.068Z"
      },
      {
        "id": "cmay6ulsc0007smegyqdlpj0p",
        "relationshipId": "cmay6ukzv0001smegx5yj5rh2",
        "permissionType": "VIEW_PRICES",
        "isGranted": false,
        "scope": "NONE",
        "scopeIds": [],
        "createdAt": "2025-05-21T16:59:49.068Z",
        "updatedAt": "2025-05-21T16:59:49.068Z"
      }
    ]
  }
]
```

### Update Relationship Status

**Endpoint:** `PATCH /api/relationships/{id}/status`

<!-- /api/relationships/statuscmay6ukzv0001smegx5yj5rh2 -->

**Purpose:** Accept, reject, or terminate a relationship

**Path Parameters:**

- `id`: Relationship ID

**Request Body:**

```json
{
  "organizationId": "your-org-id",
  "status": "ACTIVE",
  "notes": "Happy to work together"
}
```

**Response:** Updated relationship object
