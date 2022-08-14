UPDATE livestream
SET url = $(url),
    "updatedAt" = DEFAULT
WHERE "from" = $(from)
LIMIT 1 RETTURNING *;