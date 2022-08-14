UPDATE messages
SET content = $(content),
    "updatedAt" = DEFAULT
WHERE
"from" = $(
        from
    )
LIMIT 1 RETTURNING *;