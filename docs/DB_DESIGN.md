One-to-Many? Put the foreign key on the “many” side.
One user → many posts? Add userId to Post. Done.

Many-to-Many? Use a join table.
Users & Roles? Make UserRole with userId, roleId. No shame in three tables.

Avoid circular hell: Pick a “direction.”
Decide which side needs the other. The dependent holds the foreign key.

Name foreign keys clearly.
Always use snake_case_id like user_id or post_id — avoids Prisma confusion and human tears.

Don’t overthink normalization on day one.
Repeat: You can always refactor later. Working CRUD > perfect ERD.
