# Ohio Integration Backend

## Setup
1. Copy `.env.example` to `.env` and fill in credentials.
2. Run `sales.sql` to create the sales table.
3. Start backend server.

## API Endpoints
- Sales: `/api/sales/update` (POST)
- Mautic: `/api/mautic/campaign/edit`, `/campaign/delete`, `/campaign/deploy`, `/contacts/search`

## Security
- JWT + HMAC authentication
- HTTPS required
- Credentials stored in `.env`

## Error Handling
- 500 for DB errors, 401 for auth failures
- All errors logged

## Directory Structure
- backend/.env
- backend/api/
- backend/auth/
- backend/db/
- backend/mautic/
- backend/apiDocs.md
