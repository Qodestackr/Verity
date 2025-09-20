We need to scope Search Engines to specifics...

# Create org-specific index (replace ORG_ID with actual organization ID)

ORG_ID="your_org_id"
MASTER_KEY="your_master_key"

curl -X POST "http://search.alcorabooks.com/indexes" \
 -H "Authorization: Bearer ${MASTER_KEY}" \
  -H "Content-Type: application/json" \
  --data-binary '{
    "uid": "'${ORG_ID}\_customers'",
"primaryKey": "id"
}'

Modified ensure-customer-indexed.ts with org-specific indexes:

const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_URL || "http://search.alcorabooks.com";
const MEILISEARCH_INDEXING_KEY = process.env.MEILISEARCH_INDEXING_KEY; // Key with documents.\* scope

interface EnsureCustomerOptions {
orgId: string;
searchQuery: string;
}

export async function ensureCustomerIndexed({
orgId,
searchQuery
}: EnsureCustomerOptions): Promise<LoyaltyCustomer | null> {
const indexName = `${orgId}_customers`;

try {
// 1. Try Meilisearch first
const meiliCustomer = await findCustomerInMeilisearch(indexName, searchQuery);
if (meiliCustomer) return meiliCustomer;

    // 2. Fallback to database
    const dbCustomer = await findCustomerInDatabase(searchQuery);
    if (!dbCustomer) return null;

    // 3. Add to Meilisearch
    await addCustomerToMeilisearch(indexName, dbCustomer);
    return dbCustomer;

} catch (error) {
console.error(`Error ensuring customer indexed for ${indexName}:`, error);
return null;
}
}

// Modified helper functions
async function findCustomerInMeilisearch(indexName: string, searchQuery: string) {
const response = await fetch(`${MEILISEARCH_HOST}/indexes/${indexName}/search`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${MEILISEARCH_SEARCH_KEY}` // Different key for searching
},
body: JSON.stringify({
q: searchQuery,
limit: 1,
attributesToRetrieve: ['id', 'name', 'phone', 'email', 'loyaltyPoints']
})
});

if (!response.ok) {
throw new Error(`Meilisearch error: ${response.status} - ${await response.text()}`);
}

// ... rest of the existing logic
}

async function addCustomerToMeilisearch(indexName: string, customer: LoyaltyCustomer) {
const response = await fetch(`${MEILISEARCH_HOST}/indexes/${indexName}/documents`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${MEILISEARCH_INDEXING_KEY}` // Special key for writing
},
body: JSON.stringify([customer])
});

if (!response.ok) {
throw new Error(`Indexing failed: ${await response.text()}`);
}

return response.json();
}

// When searching in your components
await ensureCustomerIndexed({
orgId: "current_org_id", // Pass from your auth context
searchQuery: "wili"
});

verify index creations:

# List all indexes

curl -X GET "http://search.alcorabooks.com/indexes" \
 -H "Authorization: Bearer ${MASTER_KEY}"
