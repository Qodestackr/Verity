import { NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
    'https://www.alcorabooks.com',
    'https://alcorabooks.com',
];

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://www.alcorabooks.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Pragma',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
};

export function corsResponse(data: any, init?: ResponseInit) {
    return NextResponse.json(data, {
        ...init,
        headers: {
            ...CORS_HEADERS,
            ...init?.headers,
        },
    });
}

export function corsErrorResponse(error: string, status: number) {
    return NextResponse.json(
        { error },
        {
            status,
            headers: CORS_HEADERS,
        }
    );
}

export function corsOptionsResponse() {
    return new NextResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
    });
}

// import { corsResponse, corsErrorResponse, corsOptionsResponse } from '@/lib/cors';
// export async function GET() {
//   try {
//     const data = { message: 'Hello World' };
//     return corsResponse(data);
//   } catch (error) {
//     return corsErrorResponse('Internal Server Error', 500);
//   }
// }

// export async function OPTIONS() {
//   return corsOptionsResponse();
// }