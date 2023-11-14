-- This is a comment

--! {"name": "alternative_method", "returns": "record"}
SELECT 1 as num, 'one' as eng, 'edno' as bul, 'bir' as tur, $1 as amount;

--! {"name": "anonymous_block", "returns": "none"}
DO language plpgsql
$body$
  declare
    log_date text;
  begin
  	log_date := to_char(current_date - 1, 'dd-Mon-yyyy');
    raise log 'Humpty Dumpty sat on a wall yesterday, %', log_date;
  end;
$body$;
