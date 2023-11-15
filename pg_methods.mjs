//  Dynamic methods defined as PostgreSQL scripts

const METHOD_RX   = /^--!/,
      COMMENT_RX  = /^--[^!]|^$/,
      IDENT_RX    = /^[_a-z]\w{0,62}$/i,
      RETURN_TYPE = ['recordset','record','value','none'];

import fs from 'fs';
export default function PgMethods(pg_client, sql_filename)
{
  async function run(...args)
  {
    const res = await pg_client.query({...this.query_object, values: args});
    switch (this.returns)
    {
      case 'recordset': return res.rows;
      case 'record':    return res.rows[0];
      case 'value':     return res.rows[0][0];
      case 'none':      return null;
    }
  }
  this.sql_import = function(sql_filename)
  {
    const lines = fs.readFileSync(sql_filename, 'utf8').split('\n').map(s => s.trim());
    let line_number = 0, method_name = null;
    for (const line of lines)
    {
      line_number++;
      if (line.match(COMMENT_RX)) continue;
      if (line.match(METHOD_RX))
      {
        let method_def = null;
        try {method_def = JSON.parse(line.substr(3))} catch (ignored) {};
        if (!method_def || !(
            Object.keys(method_def).length === 2 
            && method_def.name?.match(IDENT_RX) 
            && RETURN_TYPE.includes(method_def.returns)))
          throw new Error(`Method definition error, file ${sql_filename}, line ${line_number}: ${line}`);
        method_name = method_def.name;
        this[method_name] = (method_def.returns !== 'value') ?
          {run:run, returns:method_def.returns, query_object:{name:method_name, text:''}}:
          {run:run, returns:method_def.returns, query_object:{name:method_name, text:'', rowMode:'array'}};
      }
      else
      {
        if (!method_name) throw new Error(`Syntax error, file ${sql_filename}, line ${line_number}: ${line}`);
        this[method_name].query_object.text += (line + '\n');
      }
    }
    return this;
  }
  if (sql_filename) this.sql_import(sql_filename);
}
