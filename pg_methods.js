/*
    Dynamic methods defined as PostgreSQL scripts
    S. Stefanov, Nov-2023
*/

const COMMENT_RX = /^--[^!]|^$/, METHOD_RX = /^\--!/, CRLF = '\r\n',
      RETTYPE = ['recordset','record','value'], KRID_RX = /^[_a-z]\w+$/i,
      LINEEND_RX = /[\r\n]+/;

function Pg_methods(pg_client, sql)
{
 this.sql_import = function(sql)
 {
    const lines = (sql + '').split(LINEEND_RX).map(s => s.trim());
    let line_number = 0, mName = null;
    for (const line of lines)
    {
        line_number++;
        if (line.match(COMMENT_RX)) continue;
        if (line.match(METHOD_RX))
        {
            let mDef = null;
            try {mDef = JSON.parse(line.substr(3))} catch (ignored) {};

            if (mDef == null
                ||!(Object.keys(mDef).length == 2)
                ||!('name' in mDef)
                ||!('returns' in mDef)
                ||!mDef.name.match(KRID_RX)
                ||!RETTYPE.includes(mDef.returns))
            {
                throw new Error(`Method definition syntax error, line ${line_number}: ${line}`);
            }

            mName = mDef.name;
            this[mName] = {query_object: {name:mName, text:'', values:[], returns:mDef.returns}};
            if (mDef.returns == 'value') this[mName].query_object.rowMode = 'array';

            this[mName].run = async function()
            {
                let query_object = {...this.query_object};
                query_object.values = Object.values(arguments);
                const res = await pg_client.query(this.query_object);
                switch (this.query_object.returns)
                {
                    case 'recordset':
                        return res.rows;
                    case 'record':
                        return res.rows[0];
                    case 'value':
                        return res.rows[0][0];
                }
            };
        }
        else
        {
            if (mName == null)
            {
                throw new Error(`Syntax error, line ${line_number}: ${line}`);
            }
            this[mName].query_object.text += (line + CRLF);
        }
    }
    return this;
 }
 if (sql != null) this.sql_import(sql);
}
module.exports =
{
    Pg_methods
};
