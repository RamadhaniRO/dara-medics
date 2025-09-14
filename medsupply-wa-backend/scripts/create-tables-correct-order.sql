-- MedSupply-WA Database Schema - Correct Order
-- This script creates all necessary tables in the correct dependency order

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Pharmacies table (no dependencies)
CREATE TABLE IF NOT EXISTS pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    business_hours JSONB,
    delivery_radius INTEGER NOT NULL DEFAULT 50,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 2. Users table (depends on pharmacies)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'pharmacy',
    pharmacy_id UUID REFERENCES pharmacies(id),
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products table (no dependencies)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    unit_price DECIMAL(10,2) NOT NULL,
    wholesale_price DECIMAL(10,2) NOT NULL,
    retail_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 0,
    max_stock_level INTEGER NOT NULL DEFAULT 0,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    prescription_type VARCHAR(50),
    manufacturer VARCHAR(255) NOT NULL,
    expiry_date DATE,
    batch_number VARCHAR(100),
    storage_conditions TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 4. Customers table (depends on pharmacies)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    customer_type VARCHAR(20) NOT NULL DEFAULT 'wholesale',
    credit_limit DECIMAL(10,2),
    payment_terms VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 5. Orders table (depends on pharmacies and customers)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    order_type VARCHAR(20) NOT NULL DEFAULT 'wholesale',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    delivery_method VARCHAR(20) NOT NULL DEFAULT 'delivery',
    delivery_address TEXT,
    delivery_instructions TEXT,
    special_instructions TEXT,
    confirmed_delivery_date TIMESTAMP WITH TIME ZONE,
    pickup_date TIMESTAMP WITH TIME ZONE,
    actual_delivery_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 6. Order Items table (depends on orders and products)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    prescription_verified BOOLEAN NOT NULL DEFAULT FALSE,
    prescription_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 7. Payments table (depends on orders)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(100),
    phone_number VARCHAR(20) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    description TEXT,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 8. Conversations table (depends on customers and pharmacies)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    context JSONB NOT NULL DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 9. Messages table (depends on conversations)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id VARCHAR(100) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    metadata JSONB,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    agent_processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Prescriptions table (depends on orders, customers, pharmacies)
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE,
    prescription_number VARCHAR(100) UNIQUE NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    doctor_license VARCHAR(100) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_id VARCHAR(100),
    prescription_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    verification_notes TEXT,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- 11. Agent Logs table (depends on conversations and messages)
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    input JSONB NOT NULL,
    output JSONB NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. System Metrics table (no dependencies)
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,6) NOT NULL,
    metric_unit VARCHAR(20),
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Health Check table (no dependencies)
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'ok',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_pharmacy_id ON users(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy_id ON orders(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_conversations_phone_number ON conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_logs_conversation_id ON agent_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_type ON agent_logs(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO health_check (status) VALUES ('ok') ON CONFLICT DO NOTHING;

-- Insert sample pharmacy
INSERT INTO pharmacies (
    name, license_number, contact_person, phone, email, address, city, state, country
) VALUES (
    'Sample Pharmacy', 'PH-001', 'John Doe', '+1234567890', 'contact@samplepharmacy.com',
    '123 Main St', 'Sample City', 'Sample State', 'Sample Country'
) ON CONFLICT (license_number) DO NOTHING;

-- Insert sample products
INSERT INTO products (
    name, description, category, sku, unit_price, wholesale_price, retail_price,
    stock_quantity, manufacturer, requires_prescription
) VALUES 
(
    'Paracetamol 500mg', 'Pain relief medication', 'Pain Relief', 'PAR-500-001',
    30.00, 25.00, 35.00, 100, 'PharmaCorp', FALSE
),
(
    'Amoxicillin 250mg', 'Antibiotic medication', 'Antibiotics', 'AMX-250-001',
    50.00, 40.00, 60.00, 50, 'MedCorp', TRUE
),
(
    'Vitamin D3 1000IU', 'Vitamin supplement', 'Vitamins', 'VD3-1000-001',
    25.00, 20.00, 30.00, 200, 'VitCorp', FALSE
) ON CONFLICT (sku) DO NOTHING;
