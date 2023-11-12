# PostgreSQL-methods-for-node.js
## Run PostgreSQL scripts as object methods in node.js for database-intensive applications  

**SQL file syntax**  

Here is an example - four trivial SQL queries with method specifiers.
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
1. `name` - specifies the method name;
2. `returns` - specifies the method return type. Can be one of:
   * `value` - a scalar;
   * `record` - a JSON object representing a single record;
   * `recordset` - a JSON array of objects.  

Queries can be of any length and complexity. Empty lines and leading/trailing whitespaces are ignored.  

**Building of the database gateway object**  
```js
import pgmethods from './pg_methods.js';
let db_gw = new Pg_methods(client);
```
**Importing SQL files**  
- A single SQL files can be imported by the constructor
```js
let db_gw = new Pg_methods(client, fs.readFileSync(filename));
```
- SQL files can be imported using `sql_import` method
```js
let db_gw = new Pg_methods(client);
db_gw.sql_import(fs.readFileSync(filename));
db_gw.sql_import(fs.readFileSync(another_filename));
```
- Chained
```js
let db_gw = (new Pg_methods(client))
            .sql_import(fs.readFileSync(filename))
            .sql_import(fs.readFileSync(another_filename));
```
**Invoking SQL methods**
```js
let res_a = await db_gw.the_first_method.run(10),
    res_b = await db_gw.the_second_method.run(100, 26),
    res_c = await db_gw.the_third_method.run(5),
    res_d = await db_gw.alternative_method.run();
```
**Demo script and result**
```js
const filename = 'proba.sql', another_filename = 'append.sql',
      connectionString = 'postgresql://*****:*****:5432/postgres';

import pgmethods from './pg_methods.js';

import postgresql from 'pg';
import fs from 'fs';

const client = new postgresql.Client(connectionString);
await client.connect();

try
{
    let db_gw = (new pgmethods.Pg_methods(client))
                .sql_import(fs.readFileSync(filename))
                .sql_import(fs.readFileSync(another_filename));
    
    let res_a = await db_gw.the_first_method.run(10),
        res_b = await db_gw.the_second_method.run(100, 26),
        res_c = await db_gw.the_third_method.run(5),
        res_d = await db_gw.alternative_method.run();
    
    console.log(res_a);
    console.log(res_b);
    console.log(res_c);
    console.log(res_d);
}
finally { await client.end(); }
```
![image](https://github.com/stefanov-sm/PostgreSQL-methods-for-node.js/assets/26185804/47106fa5-8f73-4691-a129-cac8659a1f08)


  
