const filename = 'proba.sql', another_filename = 'append.sql',
	  connectionString = 'postgresql://postgres:Baba123Meca@localhost:5432/postgres';

import pgmethods from './pg_methods.js';

import postgresql from 'pg';
import fs from 'fs';

const client = new postgresql.Client(connectionString);
await client.connect();

let db_gw = (new pgmethods.Pg_methods(client))
			.sql_import(fs.readFileSync(filename))
			.sql_import(fs.readFileSync(another_filename));

let res_a = await db_gw.the_first_method.run(10),
	res_b = await db_gw.the_second_method.run(100, 26),
	res_c = await db_gw.the_third_method.run(),
	res_d = await db_gw.alternative_method.run('A lot of it');

console.log(res_a);
console.log(res_b);
console.log(res_c);
console.log(res_d);

await client.end();



/*
// Simple
let db_gw = new Pg_methods(client, fs.readFileSync(filename));

// Sequential
let db_gw = new Pg_methods(client);
db_gw.sql_import(fs.readFileSync(filename));
db_gw.sql_import(fs.readFileSync(another_filename));

// Chained
let db_gw = (new Pg_methods(client))
			.sql_import(fs.readFileSync(filename))
			.sql_import(fs.readFileSync(another_filename));
*/