SELECT * from tips WHERE "from" = $(email) OR "to" = $(email) OFFSETS $(page) LIMIT $(size);