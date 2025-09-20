'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

type Props = {
    spec: Record<string, any>;
};

function ReactSwagger({ spec }: Props) {
    return (
        <div className="swagger-container">
            <style jsx global>{`
        .swagger-container {
          height: 100vh;
          overflow: auto;
        }
        
        .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .swagger-ui .topbar {
          background-color: #1f2937;
        }
        
        .swagger-ui .topbar .download-url-wrapper {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          color: #1f2937;
          font-size: 2.5rem;
          font-weight: 700;
        }
        
        .swagger-ui .info .description {
          font-size: 1rem;
          line-height: 1.6;
        }
        
        .swagger-ui .scheme-container {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
        }
        
        .swagger-ui .opblock {
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .swagger-ui .opblock.opblock-get {
          border-color: #10b981;
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: #ef4444;
        }
        
        .swagger-ui .opblock.opblock-patch {
          border-color: #8b5cf6;
        }
        
        .swagger-ui .btn.authorize {
          background-color: #10b981;
          border-color: #10b981;
        }
        
        .swagger-ui .btn.authorize:hover {
          background-color: #059669;
          border-color: #059669;
        }
        
        .swagger-ui .parameter__name {
          font-weight: 600;
        }
        
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
        
        /* Custom scrollbar */
        .swagger-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .swagger-container::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .swagger-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        .swagger-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .swagger-ui {
            filter: invert(1) hue-rotate(180deg);
          }
          
          .swagger-ui img {
            filter: invert(1) hue-rotate(180deg);
          }
        }
      `}</style>

            <SwaggerUI
                spec={spec}
                docExpansion="list"
                defaultModelExpandDepth={2}
                defaultModelsExpandDepth={2}
                displayOperationId={false}
                displayRequestDuration={true}
                filter={true}
                showExtensions={true}
                showCommonExtensions={true}
                tryItOutEnabled={true}
                requestInterceptor={(req) => {
                    // Add any global request modifications here
                    // e.g., add organization context, additional headers, etc.
                    return req;
                }}
                responseInterceptor={(res) => {
                    // Add any global response processing here
                    return res;
                }}
            />
        </div>
    );
}

export default ReactSwagger;