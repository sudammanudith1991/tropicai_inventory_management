-- V1__initial_schema.sql
-- Tropicai Inventory Management - Initial Schema

-- Users & Roles
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'STAFF', -- ADMIN, STAFF
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Products (grain types)
CREATE TABLE products (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,  -- e.g. tamarind, mung beans
    unit            VARCHAR(20)  NOT NULL DEFAULT 'kg',
    low_stock_alert NUMERIC(10,2) NOT NULL DEFAULT 5.0,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Vendors
CREATE TABLE vendors (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL UNIQUE,  -- e.g. RajapakshaStores (Thanamalwila)
    location    VARCHAR(150),
    phone       VARCHAR(20),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL UNIQUE,
    location        VARCHAR(150),
    phone           VARCHAR(20),
    customer_type   VARCHAR(20)  NOT NULL DEFAULT 'RETAIL', -- RETAIL, WHOLESALE
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Vendor Purchases (buying stock)
CREATE TABLE vendor_purchases (
    id              BIGSERIAL PRIMARY KEY,
    purchase_date   DATE         NOT NULL,
    vendor_id       BIGINT       NOT NULL REFERENCES vendors(id),
    product_id      BIGINT       NOT NULL REFERENCES products(id),
    quantity_kg     NUMERIC(10,2) NOT NULL,
    buying_price_per_kg NUMERIC(10,2) NOT NULL,
    total_cost      NUMERIC(12,2) GENERATED ALWAYS AS (quantity_kg * buying_price_per_kg) STORED,
    wastage_kg      NUMERIC(10,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_by      BIGINT       REFERENCES users(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Customer Orders (selling stock)
CREATE TABLE customer_orders (
    id              BIGSERIAL PRIMARY KEY,
    order_date      DATE         NOT NULL,
    customer_id     BIGINT       NOT NULL REFERENCES customers(id),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CREDIT
    total_revenue   NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_credit    NUMERIC(12,2) NOT NULL DEFAULT 0,
    settled_amount  NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_by      BIGINT       REFERENCES users(id),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Order Line Items
CREATE TABLE order_items (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT        NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
    product_id          BIGINT        NOT NULL REFERENCES products(id),
    quantity_kg         NUMERIC(10,2) NOT NULL,
    selling_price_per_kg NUMERIC(10,2) NOT NULL,
    revenue             NUMERIC(12,2) GENERATED ALWAYS AS (quantity_kg * selling_price_per_kg) STORED,
    settled_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    credit_amount       NUMERIC(12,2) GENERATED ALWAYS AS (quantity_kg * selling_price_per_kg - settled_amount) STORED
);

-- Other Costs (fuel, transport, etc.)
CREATE TABLE other_costs (
    id          BIGSERIAL PRIMARY KEY,
    cost_date   DATE         NOT NULL,
    cost_type   VARCHAR(100) NOT NULL,
    amount      NUMERIC(12,2) NOT NULL,
    notes       TEXT,
    created_by  BIGINT       REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Stock view (computed from purchases minus sales minus wastage)
CREATE VIEW stock_levels AS
SELECT
    p.id         AS product_id,
    p.name       AS product_name,
    p.unit,
    p.low_stock_alert,
    COALESCE(SUM(vp.quantity_kg - vp.wastage_kg), 0)           AS total_purchased,
    COALESCE((SELECT SUM(oi.quantity_kg)
              FROM order_items oi
              WHERE oi.product_id = p.id), 0)                  AS total_sold,
    COALESCE(SUM(vp.quantity_kg - vp.wastage_kg), 0) -
    COALESCE((SELECT SUM(oi.quantity_kg)
              FROM order_items oi
              WHERE oi.product_id = p.id), 0)                  AS remaining_stock,
    CASE
        WHEN (COALESCE(SUM(vp.quantity_kg - vp.wastage_kg), 0) -
              COALESCE((SELECT SUM(oi.quantity_kg)
                        FROM order_items oi
                        WHERE oi.product_id = p.id), 0)) <= p.low_stock_alert
        THEN TRUE ELSE FALSE
    END AS is_low_stock
FROM products p
LEFT JOIN vendor_purchases vp ON vp.product_id = p.id
WHERE p.active = TRUE
GROUP BY p.id, p.name, p.unit, p.low_stock_alert;

-- Credit summary view
CREATE VIEW customer_credit_summary AS
SELECT
    c.id            AS customer_id,
    c.name          AS customer_name,
    c.location,
    COALESCE(SUM(co.total_revenue), 0)    AS total_sales,
    COALESCE(SUM(co.total_credit), 0)     AS total_credit,
    COALESCE(SUM(co.settled_amount), 0)   AS total_settled,
    COALESCE(SUM(co.total_credit) - SUM(co.settled_amount), 0) AS outstanding_credit
FROM customers c
LEFT JOIN customer_orders co ON co.customer_id = c.id
WHERE c.active = TRUE
GROUP BY c.id, c.name, c.location;

-- Seed default admin user (password: Admin@123 - change immediately)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@tropicai.lk',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY.5AHmne9Hbpwm',
        'ADMIN');

-- Seed products from the Excel tracker
INSERT INTO products (name, low_stock_alert) VALUES
    ('tamarind', 5),
    ('sesame seeds', 2),
    ('mung beans', 5),
    ('red cowpea', 3),
    ('olu hal', 2),
    ('kurakkan', 2),
    ('mustard seeds', 1),
    ('white cowpea', 3),
    ('rata kaju (no pothu)', 2),
    ('undu', 3),
    ('kollu', 2),
    ('soya beans', 2),
    ('beli pieces', 1),
    ('meneri', 1),
    ('pani dodam', 2),
    ('murunga', 2);

-- Seed vendors from the Excel tracker
INSERT INTO vendors (name, location) VALUES
    ('RajapakshaStores', 'Thanamalwila'),
    ('Rajakaruna', 'Thanamalwila'),
    ('Vegetable Wholesale', 'Thanamalwila');

-- Seed customers from the Excel tracker
INSERT INTO customers (name, location, customer_type) VALUES
    ('Sena Stores', 'Lakshapana', 'WHOLESALE'),
    ('Ajith Stores', 'Lakshapana', 'WHOLESALE'),
    ('Sunil Stores', 'Lakshapana', 'WHOLESALE'),
    ('Chamma kade', 'Lakshapana', 'RETAIL'),
    ('Amaringhe', 'Lakshapana', 'WHOLESALE'),
    ('Norton akka', 'Lakshapana', 'RETAIL'),
    ('Kitchen Shop', 'Ginigath Hena', 'WHOLESALE'),
    ('Mawala Stores', 'Wadduwa', 'WHOLESALE'),
    ('Dissanayake Agro mart', 'Lakshapana', 'WHOLESALE'),
    ('Sampath', 'Lakshapana', 'RETAIL'),
    ('Nimesha', 'Lakshapana', 'RETAIL'),
    ('kaveesha', 'Lakshapana', 'RETAIL'),
    ('Senevi kade', 'Lakshapana', 'RETAIL'),
    ('Fruit Juice kade', 'Lakshapana', 'WHOLESALE'),
    ('Owita Organics', 'Lakshapana', 'WHOLESALE');
