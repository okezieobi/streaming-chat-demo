INSERT INTO users(email) VALUES($(email));
UPDATE users SET password = crypt($(password), gen_salt('md5'));