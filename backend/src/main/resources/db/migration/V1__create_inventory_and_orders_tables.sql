CREATE TABLE IF NOT EXISTS inventory (
    id            BIGINT          NOT NULL AUTO_INCREMENT,
    sku           VARCHAR(100)    NOT NULL,
    name          VARCHAR(200)    NOT NULL,
    description   TEXT,
    quantity      INT             NOT NULL DEFAULT 0,
    unit_price    DECIMAL(10, 2)  NOT NULL,
    reorder_level INT                      DEFAULT 10,
    created_at    DATETIME        NOT NULL,
    updated_at    DATETIME        NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_inventory_sku UNIQUE (sku)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id             BIGINT          NOT NULL AUTO_INCREMENT,
    order_number   VARCHAR(50)     NOT NULL,
    customer_name  VARCHAR(200)    NOT NULL,
    customer_email VARCHAR(200),
    status         VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    total_amount   DECIMAL(10, 2)  NOT NULL DEFAULT 0.00,
    notes          TEXT,
    created_at     DATETIME        NOT NULL,
    updated_at     DATETIME        NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_orders_order_number UNIQUE (order_number),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;
