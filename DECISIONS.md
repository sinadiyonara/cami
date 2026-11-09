# Decisions

## Prioritisation
1. Fixed the CI pipeline: Started by fixing a variable naming issue in the GitHub Actions workflow.

2. Set up pgAdmin: Added pgAdmin to make it easier to observe and manage the database during development.

3. Set up the AI development environment: Prepared the project for AI-assisted development.

4. Improved request listing api: Updated RequestsService.list() to reduce database queries and avoid the N+1 query problem.

5. Updated query invalidation: Added invalidateQueries after mutations to make sure the UI is updated correctly.

6. Created ClassificationService: Moved classification related logic into a separate service to keep the code better organized.

7. Implemented classification history: Added the database changes and API logic needed to save and retrieve classification history.

8. Other improvements – Made some additional changes, fixed issues, folder restructurings and added tests where needed.

## Assumptions
- Since no authentication is implmemented, request authentication validation is not required at this stage
- The keyword rules are kept as it is since it is enough for the assignment.
- History should stay even if the request is deleted.
- It should save every classify call, even if there is no `requestId`.

## Trade-offs
I used plain SQL with a join for the list() query because it is easy to read and give higher performance. But the downside is that TypeScript cannot check the column names.

After a status change or classification, the web app uses invalidateQueries to fetch the full list again. This can be improved by addling more complex implementation to data fetch logic with direct cache updates.

Classification history stores its own copy of the original message. This means the history remains available even if the original request is deleted, but the same message is stored twice replicate the data.

Tests come in two types:
- Mock tests: I used mocks and run without a database. They cover the business rules quickly but cannot check SQL.
- Integration tests: Start the real controller and services against PostgreSQL. They run the real SQL, migrations and transactions.

The trade-off is that integration tests need Postgres. Locally they are skipped if no database is reachable.

## Classification history scope

Every classify call now saves a record in the new `classifications` table. It stores the message, category, confidence, provider, timestamp, and `request_id` if available.

`GET /requests/history` returns the latest 100 records, newest first, with an optional category filter.

The `/history` page now shows the records in a table with a category dropdown. I also added loading, empty and error states.


## Stretch (if any)

Error handling: Fixed invalid input responses to return proper HTTP 400 errors.

Folder restructuring: Restructured the api codebase for better understanding and maintanance.

PgAdmin: I configurted pgAdmin in docker compose to make it easier to observe the db.

## What you would do with more time

 - Currently, classification runs in the main request flow. If we integrate an AI-based classifier, it could increase response times while waiting for the classification to complete. I would move this process to a background worker using a queue. This would keep the API responsive while the worker handles classification asynchronously.

 - Add pagination to `GET /requests` and history.

 - While reviewing the classification work, I found that the request classifier runs before checking that the request exists. That logic needs to be refactored.

 - Custom invalidation for data fetching logic