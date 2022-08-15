UPDATE messages
SET content = $(content),
    "updatedAt" = DEFAULT
WHERE
id = $(id) AND "from" = $(from)
RETURNING *;