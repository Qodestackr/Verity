
import { type TypedDocumentNode, type OperationContext } from "@urql/core";

import { gqlclient } from "@/lib/graphql";

export async function executeGraphQL<Result, Variables>(
  document: TypedDocumentNode<Result, Variables>,
  options: {
    variables?: Variables;
    revalidate?: number;
    cache?: RequestCache;
    skipCache?: boolean;
    operationName?: string;
    token?: string;
    context?: Partial<OperationContext>;
  }
): Promise<Result> {
  const {
    variables,
    revalidate,
    cache = "no-store",
    skipCache = false,
    operationName,
    token,
    context = {},
  } = options;

  // Extract operation name for cache key
  const docOpName =
    operationName ||
    (document.definitions[0]?.kind === "OperationDefinition" &&
      document.definitions[0]?.name?.value);

  const result = await gqlclient
    .query(document, {
      ...(variables || {}),
      context: {
        fetchOptions: {
          cache,
          next: { revalidate },
          // next: revalidate ? { revalidate } : undefined,
        },
      },
    })
    .toPromise();

  if (result.error) {
    console.error("GraphQL Error:", result.error);
    throw new Error(`GraphQL Error: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL query");
  }

  return result.data;
}

export async function executeMutation<Result, Variables>(
  document: TypedDocumentNode<Result, Variables>,
  options: {
    variables?: Variables;
    token?: string;
    invalidateQueries?: string[];
    context?: Partial<OperationContext>;
  }
): Promise<Result> {
  const { variables, token, invalidateQueries = [], context = {} } = options;

  const result = await gqlclient
    .mutation(document, variables || {})
    .toPromise();

  if (result.error) {
    console.error("GraphQL Mutation Error:", result.error);
    throw new Error(`GraphQL Mutation Error: ${result.error.message}`);
  }

  if (!result.data) {
    throw new Error("No data returned from GraphQL mutation");
  }

  return result.data;
}
