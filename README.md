# PostgreSQL methods for node.js
**PostgreSQL scripts as object methods in node.js for database-intensive applications**  

## SQL file syntax

Example - four trivial SQL queries with method specifiers.
```sql
-- A query that yields a single record
--! {"name": "the_first_method", "returns": "record"}
SELECT n num, format('As text: %s', n) txt
  from generate_series(1, 100, 1) s(n)
 where n = $1;
  
-- A query that yields a single value
--! {"name": "the_second_method", "returns": "value"}
SELECT to_char(n, 'FMRN') rn
  from generate_series(1, $1, 1) s(n)
 where n = $2;

-- A query that yields a set of records
--! {"name": "the_third_method", "returns": "recordset"}
SELECT n, to_char(n, 'FMRN') rn
  from generate_series(1, $1, 1) s(n);

-- A query with no parameters
--! {"name": "alternative_method", "returns": "record"}
SELECT 1 as num, 'one' as eng, 'edno' as bul, 'bir' as tur, 'ANY' as amount;
```
Method specifiers are lines that start with `--!` folowed by JSON with exactly these mandatory attributes:
1. `"name"` - specifies the method name as a valid identifier, up to 63 characters;
2. `"returns"` - specifies the method return type. Can be one of:
   * `"value"` - a scalar;
   * `"record"` - a JSON object representing a single record;
   * `"recordset"` - a JSON array of objects;  
   * `"none"`

Queries can be of any length and complexity. Comments, empty lines and leading/trailing whitespaces are ignored.  

> [!NOTE]
> PgMethods uses [prepared statements](https://node-postgres.com/features/queries#prepared-statements).
 
> [!IMPORTANT]
> SQL files must be UTF-8 encoded.  

## Building the database gateway object  
```js
import PgMethods from './../pg_methods.mjs';
let db_gw = new PgMethods(client);
```
## Importing SQL files  
- A single SQL file can be imported by the constructor
```js
let db_gw = new PgMethods(client, fs.readFileSync(filename));
```
- SQL files can be imported using `sql_import` method
```js
let db_gw = new PgMethods(client);
db_gw.sql_import(fs.readFileSync(filename));
db_gw.sql_import(fs.readFileSync(another_filename));
```
- Chained
```js
let db_gw = (new PgMethods(client))
            .sql_import(fs.readFileSync(filename))
            .sql_import(fs.readFileSync(another_filename));
```
## Invoking SQL methods
```js
let res = await db_gw.the_first_method.run(10);
```
## Demo script and result
```js
import PgMethods from './../pg_methods.mjs';
import pg from 'pg';

const pg_client = new pg.Client();  // uses environment variables
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
finally { await pg_client.end(); } // database connection leak protection
```
![image](https://github.com/stefanov-sm/node.js-PgMethods/assets/26185804/c49b89b7-9cb2-4247-b5fa-d48bf9b57735)

## Database gateway object
![image](https://github.com/stefanov-sm/node.js-Pg_methods/assets/26185804/e089afc6-af50-407b-a851-01042a72d1eb)



