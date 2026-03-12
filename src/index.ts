import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { UserInsert, usersTable } from './db/schema';
import { and, eq } from 'drizzle-orm';
import * as schema from './db/schema';

const DB_URL = process.env.DATABASE_URL;

if (!DB_URL) {
  throw new Error('DATABASE_URL is not set');
}

const db = drizzle(DB_URL, {
  schema,
});

async function main() {
  //eliminar todo para poder estar ejecutando en este ejemplo
  await db.delete(usersTable);
  /////////////////////////////////

  const newUsers: UserInsert[] = [
    {
      age: 30,
      name: 'John Doe',
      email: 'john@doe.com',
      phone: '+1 (555) 555-5555',
    },
    {
      age: 22,
      name: 'Kenneth Vanegas',
      email: 'kenneth@vanegas.com',
      phone: '+1 (555) 555-5555',
    },
  ];

  //insert/////////////////////////////////
  await db.insert(usersTable).values(newUsers);

  const usersAfterCreate = await db.select().from(usersTable);

  console.log('Users after create:');
  console.table(usersAfterCreate);

  //update//////////////////////////////////////
  await db
    .update(usersTable)
    .set({
      age: 44,
    })
    .where(
      and(
        eq(usersTable.name, 'Kenneth Vanegas'),
        eq(usersTable.email, 'kenneth@vanegas.com'),
      ),
    );

  ////////////////////////////////////////////
  const userAfterUpdate = await db.query.usersTable.findMany();
  console.log('User after update:');
  console.table(userAfterUpdate);

  ///////////////////////////////// qry api
  const findeUser = await db.query.usersTable.findFirst({
    where: (usersTableFromQuery, { eq }) =>
      eq(usersTableFromQuery.email, 'kenneth@vanegas.com'),
  });
  console.log('FindeUser:');
  console.table(findeUser);

  ///////////////////// delete
  await db
    .delete(usersTable)
    .where(eq(usersTable.email, 'kenneth@vanegas.com'));

  const finalUserrs = await db.query.usersTable.findMany();
  console.log('Final Userrs:');
  console.table(finalUserrs);

  //// INSERTAR POST AL UNICO USUARIO QUE HAY
  if (finalUserrs.length === 0) return;

  const finalUser = finalUserrs[0];

  await db.insert(schema.postsTable).values({
    title: 'Post 1',
    content: 'Post content 1',
    userId: finalUser.id,
  });

  const userWithPosts = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.id, finalUser.id),
    with: {
      posts: true,
    },
  });

  console.log('User with posts:');
  console.table(userWithPosts);
  console.log('Posts:');
  console.table(userWithPosts?.posts);

}

main().catch(console.error);
