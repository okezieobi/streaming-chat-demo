SELECT * from tips WHERE "from" = $(email) OR "to" = $(email) OFFSET $(page) LIMIT $(size);