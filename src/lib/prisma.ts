
import { Prisma, PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;


export const PRISMA_ERROR_CODES = {
  VALUE_TOO_LONG: "P2000",
  RECORD_NOT_FOUND: "P2001",
  UNIQUE_CONSTRAINT_VIOLATION: "P2002",
  FOREIGN_CONSTRAINT_VIOLATION: "P2003",
} as const;

export function isPrismaError(error: unknown, code: keyof typeof PRISMA_ERROR_CODES) {

  return error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_ERROR_CODES[code];
}

export function isPrismaUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION;
}

export function isPrismaNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND;
}

// export function isPrismaUniqueConstraintViolation(
//   error: unknown,
//   modelName: string,
//   target: string | string[]
// ): error is Prisma.PrismaClientKnownRequestError {
//   if (!isPrismaError(error, "UNIQUE_CONSTRAINT_VIOLATION")) return false;
//   return error.meta?.modelName === modelName &&
//     deepPlainEquals(error.meta.target, target);
// }

// // Basic transaction wrapper
// export async function withTransaction<T>(
//   fn: (tx: PrismaClient) => Promise<T>
// ): Promise<T> {
//   return prisma.$transaction(fn);
// }
// export async function withTransaction<T>(
//   fn: (tx: PrismaClient) => Promise<T>
// ): Promise<T> {
//   return prisma.$transaction(fn, {
//     timeout: 100_00,
//     maxWait: 500_0,
//   });
// }