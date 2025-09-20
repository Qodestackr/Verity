import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder: "app/api", // Your API folder structure
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Alcora API Documentation",
                version: "1.0.0",
                description: `
# Alcora API Documentation

Welcome to the Alcora API! This comprehensive API powers our e-commerce platform built on Saleor.

## API Structure

Our API is organized into the following main modules:

- **Accounting**: Financial management including budgets, expenses, sales, and vendor management
- **Auth**: Authentication and authorization endpoints
- **Billing**: Payment processing and billing management
- **Cache**: Caching mechanisms for products and other data
- **Campaigns**: Marketing campaign management
- **Deliveries**: Order delivery and logistics
- **Drivers**: Delivery driver management
- **Inventory**: Stock and inventory management
- **Invitations**: User invitation system
- **Invoices**: Invoice generation and management
- **Loyalty**: Customer loyalty program
- **Onboarding**: User and organization onboarding
- **Orders**: Order processing and management
- **Organizations**: Multi-tenant organization management
- **Payment Methods**: Payment gateway integrations
- **POS**: Point of sale functionality
- **Product Sync**: Product synchronization with Saleor
- **Relationships**: Entity relationship management
- **Routes**: Delivery route optimization
- **Subscriptions**: Subscription management
- **Warehouses**: Warehouse and inventory location management
- **Webhooks**: External system integrations

## Authentication

Most endpoints require authentication. Use the Bearer token in the Authorization header:

\`Authorization: Bearer <your-jwt-token>\`
        `,
                contact: {
                    name: "Alcora API Team",
                    url: "https://alcora.com/support",
                    email: "api-support@alcora.com"
                },
                license: {
                    name: "MIT",
                    url: "https://opensource.org/licenses/MIT"
                }
            },
            servers: [
                {
                    url: "http://localhost:3000",
                    description: "Development server"
                },
                {
                    url: "https://api.alcora.com",
                    description: "Production server"
                },
                {
                    url: "https://staging-api.alcora.com",
                    description: "Staging server"
                }
            ],
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        description: "JWT Bearer token for authentication"
                    },
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key",
                        description: "API Key for service-to-service authentication"
                    }
                },
                schemas: {
                    Error: {
                        type: "object",
                        properties: {
                            error: {
                                type: "string",
                                description: "Error message"
                            },
                            code: {
                                type: "string",
                                description: "Error code"
                            },
                            details: {
                                type: "object",
                                description: "Additional error details"
                            }
                        },
                        required: ["error"]
                    },
                    PaginationMeta: {
                        type: "object",
                        properties: {
                            page: {
                                type: "integer",
                                description: "Current page number"
                            },
                            limit: {
                                type: "integer",
                                description: "Items per page"
                            },
                            total: {
                                type: "integer",
                                description: "Total number of items"
                            },
                            totalPages: {
                                type: "integer",
                                description: "Total number of pages"
                            }
                        }
                    },
                    User: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "User ID"
                            },
                            email: {
                                type: "string",
                                format: "email",
                                description: "User email"
                            },
                            firstName: {
                                type: "string",
                                description: "First name"
                            },
                            lastName: {
                                type: "string",
                                description: "Last name"
                            },
                            role: {
                                type: "string",
                                enum: ["admin", "manager", "employee", "customer"],
                                description: "User role"
                            },
                            organizationId: {
                                type: "string",
                                description: "Organization ID"
                            },
                            createdAt: {
                                type: "string",
                                format: "date-time",
                                description: "Creation timestamp"
                            },
                            updatedAt: {
                                type: "string",
                                format: "date-time",
                                description: "Last update timestamp"
                            }
                        }
                    },
                    Organization: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "Organization ID"
                            },
                            name: {
                                type: "string",
                                description: "Organization name"
                            },
                            slug: {
                                type: "string",
                                description: "URL-friendly organization identifier"
                            },
                            settings: {
                                type: "object",
                                description: "Organization-specific settings"
                            },
                            status: {
                                type: "string",
                                enum: ["active", "inactive", "pending"],
                                description: "Organization status"
                            }
                        }
                    },
                    Product: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "Product ID"
                            },
                            name: {
                                type: "string",
                                description: "Product name"
                            },
                            sku: {
                                type: "string",
                                description: "Stock Keeping Unit"
                            },
                            price: {
                                type: "number",
                                format: "float",
                                description: "Product price"
                            },
                            currency: {
                                type: "string",
                                description: "Price currency code"
                            },
                            inStock: {
                                type: "boolean",
                                description: "Stock availability"
                            },
                            quantity: {
                                type: "integer",
                                description: "Available quantity"
                            }
                        }
                    },
                    Order: {
                        type: "object",
                        properties: {
                            id: {
                                type: "string",
                                description: "Order ID"
                            },
                            number: {
                                type: "string",
                                description: "Human-readable order number"
                            },
                            status: {
                                type: "string",
                                enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
                                description: "Order status"
                            },
                            total: {
                                type: "number",
                                format: "float",
                                description: "Order total amount"
                            },
                            currency: {
                                type: "string",
                                description: "Order currency"
                            },
                            customerId: {
                                type: "string",
                                description: "Customer ID"
                            },
                            items: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        productId: {
                                            type: "string"
                                        },
                                        quantity: {
                                            type: "integer"
                                        },
                                        unitPrice: {
                                            type: "number",
                                            format: "float"
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    UnauthorizedError: {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error"
                                },
                                example: {
                                    error: "Authentication required",
                                    code: "UNAUTHORIZED"
                                }
                            }
                        }
                    },
                    ForbiddenError: {
                        description: "Access forbidden",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error"
                                },
                                example: {
                                    error: "Access forbidden",
                                    code: "FORBIDDEN"
                                }
                            }
                        }
                    },
                    NotFoundError: {
                        description: "Resource not found",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error"
                                },
                                example: {
                                    error: "Resource not found",
                                    code: "NOT_FOUND"
                                }
                            }
                        }
                    },
                    ValidationError: {
                        description: "Validation error",
                        content: {
                            "application/json": {
                                schema: {
                                    $ref: "#/components/schemas/Error"
                                },
                                example: {
                                    error: "Validation failed",
                                    code: "VALIDATION_ERROR",
                                    details: {
                                        field: "email",
                                        message: "Invalid email format"
                                    }
                                }
                            }
                        }
                    }
                },
                parameters: {
                    PageParam: {
                        name: "page",
                        in: "query",
                        description: "Page number for pagination",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 1
                        }
                    },
                    LimitParam: {
                        name: "limit",
                        in: "query",
                        description: "Number of items per page",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 20
                        }
                    },
                    OrganizationIdParam: {
                        name: "organizationId",
                        in: "path",
                        description: "Organization ID",
                        required: true,
                        schema: {
                            type: "string"
                        }
                    }
                }
            },
            security: [
                {
                    BearerAuth: []
                }
            ],
            tags: [
                {
                    name: "Authentication",
                    description: "User authentication and authorization"
                },
                {
                    name: "Accounting",
                    description: "Financial management and accounting operations"
                },
                {
                    name: "Billing",
                    description: "Payment processing and billing management"
                },
                {
                    name: "Orders",
                    description: "Order processing and management"
                },
                {
                    name: "Inventory",
                    description: "Stock and inventory management"
                },
                {
                    name: "Products",
                    description: "Product catalog management"
                },
                {
                    name: "Organizations",
                    description: "Multi-tenant organization management"
                },
                {
                    name: "Users",
                    description: "User management operations"
                },
                {
                    name: "Deliveries",
                    description: "Order delivery and logistics"
                },
                {
                    name: "Webhooks",
                    description: "External system integrations"
                }
            ]
        },
    });

    return spec;
};