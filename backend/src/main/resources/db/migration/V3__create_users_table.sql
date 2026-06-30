CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    password    VARCHAR(255),
    provider    VARCHAR(20)  NOT NULL DEFAULT 'LOCAL',
    provider_id VARCHAR(255),
    role        VARCHAR(20)  NOT NULL DEFAULT 'USER',
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;
