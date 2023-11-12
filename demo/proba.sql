  -- STEFANVS·S·DIGITARIVS·PRIMVS·FECIT
  -- This is a comment too
  
  -- This line must bang
  
  --! {"name": "the_first_method", "returns": "record"}
  
SELECT n num, format('As text: %s', n) txt
  from generate_series(1, 100, 1) s(n)
  where n = $1;
  
  --! {"name": "the_second_method", "returns": "value"}
  
SELECT to_char(n, 'FMRN') rn
  from generate_series(1, $1, 1) s(n)
  where n = $2;
  
  --! {"name": "the_third_method", "returns": "recordset"}
  
SELECT n, to_char(n, 'FMRN') rn
  from generate_series(1, 10, 1) s(n);