INSERT INTO livestreams(url, "userId", live) VALUES($(url), $(userId), TRUE) RETURNING *;