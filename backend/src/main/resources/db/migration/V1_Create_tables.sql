CREATE TABLE freezer (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         file VARCHAR(255) NOT NULL,
                         number VARCHAR(4) UNIQUE NOT NULL,
                         address VARCHAR(50) NOT NULL,
                         room VARCHAR(10) NOT NULL,
                         type VARCHAR(10) NOT NULL
);

CREATE TABLE users (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL,
                        phone_number VARCHAR(20) NOT NULL,
                        email VARCHAR(50) NOT NULL UNIQUE,
                        user_rank INT NOT NULL,
                        role VARCHAR(50) NOT NULL
);

CREATE TABLE freezer_user (
                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              freezer_id BIGINT NOT NULL,
                              user_id BIGINT NOT NULL,
                              CONSTRAINT fk_freezer FOREIGN KEY (freezer_id) REFERENCES freezer(id) ON DELETE CASCADE,
                              CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES userdb(id) ON DELETE CASCADE,
                              UNIQUE (freezer_id, user_id)
);
