CREATE TABLE IF NOT EXISTS products (
    id          BIGINT         NOT NULL AUTO_INCREMENT,
    sku         VARCHAR(100)   NOT NULL,
    name        VARCHAR(200)   NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    unit_price  DECIMAL(10, 2) NOT NULL,
    active      TINYINT(1)     NOT NULL DEFAULT 1,
    created_at  DATETIME       NOT NULL,
    updated_at  DATETIME       NOT NULL,

    PRIMARY KEY (id),
    CONSTRAINT uq_products_sku UNIQUE (sku)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4;

ALTER TABLE inventory
    ADD COLUMN product_id BIGINT,
    ADD CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES products (id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;

ALTER TABLE orders
    ADD COLUMN product_id BIGINT,
    ADD CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products (id)
            ON DELETE SET NULL
            ON UPDATE CASCADE;
