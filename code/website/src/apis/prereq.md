## Did not expect a logical conjunction
These example are all bad
```surrealql
[course:abc, "OR", "AND"] -- Fails on "AND"
["OR", course:abc, course:123] -- fails on "OR"
```
