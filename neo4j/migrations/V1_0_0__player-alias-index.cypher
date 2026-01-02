CREATE FULLTEXT INDEX playerNames
FOR (p:Player)
ON EACH [p.rglName, p.etf2lName]
