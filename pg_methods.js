/*
    Dynamic methods defined as PostgreSQL scripts
    S. Stefanov, Nov-2023
*/

const COMMENT_RX = /^--[^!]|^$/, METHOD_RX = /^\--!/, IDENT_RX = /^[_a-z]\w{0,62}$/i,
      RETURN_TYPE = ['recordset', 'record', 'value'], NEWLINE = '\n';

function Pg_methods(pg_client, sql)
{
 this.sql_import = function(sql)
 {
    const lines = (sql + '').split(NEWLINE).map(s => s.trim());
    let line_number = 0, method_name = null;
    for (const line of lines)
    {
        line_number++;
        if (line.match(COMMENT_RX)) continue;
        if (line.match(METHOD_RX))
        {
            let method_def = null;
            try {method_def = JSON.parse(line.substr(3))} catch (ignored) {};

            if (!method_def
                ||!(Object.keys(method_def).length == 2)
                ||!('name' in method_def)
                ||!('returns' in method_def)
                ||!method_def.name.match(IDENT_RX)
                ||!RETURN_TYPE.includes(method_def.returns))
            {
                throw new Error(`Method definition error, line ${line_number}: ${line}`);
            }

            method_name = method_def.name;
            this[method_name] = {query_object: {name:method_name, text:'', values:[]}, returns:method_def.returns};
            if (method_def.returns === 'value') this[method_name].query_object.rowMode = 'array';

            this[method_name].run = async function(...args)
            {
                let query_object = {...this.query_object};
                query_object.values = args;
                const res = await pg_client.query(query_object);
                switch (this.returns)
                {
                    case 'recordset': return res.rows;
                    case 'record':    return res.rows[0];
                    case 'value':     return res.rows[0][0];
                }
            }
        }
        else
        {
            if (!method_name)
            {
                throw new Error(`Syntax error, line ${line_number}: ${line}`);
            }
            this[method_name].query_object.text += (line + NEWLINE);
        }
    }
    return this;
 }
 if (sql) this.sql_import(sql);
}
module.exports =
{
    Pg_methods
};
