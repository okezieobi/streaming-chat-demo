SELECT * from messages WHERE from = $(email) OR  to = $(email) OFFSETS $(page) LIMIT $(size);