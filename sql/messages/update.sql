UPDATE messages
SET content = $(content),
    "updatedAt" = DEFAULT
WHERE
id = $(id) AND "from" = $(from)
LIMIT 1 RETTURNING *;