INSERT INTO messages(from, content, to) VALUES($(from), $(content), $(to)) RETURNING *;