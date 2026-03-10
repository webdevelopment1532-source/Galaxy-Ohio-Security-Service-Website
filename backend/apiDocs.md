# Ohio Integration API Documentation

## Environment Variables
- OHIO_DB_HOST, OHIO_DB_USER, OHIO_DB_PASS, OHIO_DB_NAME
- OHIO_INTEGRATION_SECRET
- MAUTIC_BASE_URL, MAUTIC_USERNAME, MAUTIC_PASSWORD

## Authentication & Security
- JWT authentication: Authorization: Bearer <token>
- HMAC signature: x-galaxy-signature, x-galaxy-timestamp
- Use OHIO_INTEGRATION_SECRET for HMAC
- HTTPS required for all APIs
- Basic Auth for Mautic (demo), OAuth2 for production

## Database Schema
- sales: saleId, amount, customerId, sale_date, status, notes

## API Endpoints
### POST /api/sales/update
- Headers: Authorization, x-galaxy-signature, x-galaxy-timestamp
- Body: saleId, amount, customerId, sale_date, status, notes
- Response: { success: true } or error

### Mautic Endpoints
- POST /api/mautic/campaign/edit
- DELETE /api/mautic/campaign/delete
- POST /api/mautic/campaign/deploy
- GET /api/mautic/contacts/search

## Error Handling
- 500 for DB errors, 401 for auth failures
- All integration errors logged

## Setup Instructions
- Copy .env.example to .env and fill values
- Run sales.sql to create sales table
- Start backend server

## Request/Response Formats
- JSON for all endpoints

## Directory Structure
- backend/.env
- backend/api/
- backend/auth/
- backend/db/
- backend/mautic/
- backend/apiDocs.md

## Integration Steps
- Set up .env
- Implement authentication middleware
- Connect to MySQL
- Implement endpoints
- Integrate with Mautic
- Validate/log requests/responses
- Provide integration documentation
