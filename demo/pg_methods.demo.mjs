import PgMethods from './../pg_methods.mjs';
import pg from 'pg';

const pg_client = new pg.Client(); // uses environment variables
await pg_client.connect();
try
{
  let db_gw = new PgMethods(pg_client); 
  db_gw.sql_import('proba.sql')
       .sql_import('append.sql');
  let res_a = await db_gw.the_first_method.run(10),
      res_b = await db_gw.the_second_method.run(100, 26),
      res_c = await db_gw.the_third_method.run(5),
      res_d = await db_gw.alternative_method.run('Количество');
  await db_gw.anonymous_block.run();
  console.log(res_a);
  console.log(res_b);
  console.log(res_c);
  console.log(res_d);
}
finally { await pg_client.end(); } 
