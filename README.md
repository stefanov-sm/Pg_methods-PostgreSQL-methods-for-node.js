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

Queries can be of any length and complexity.  

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
 


  
