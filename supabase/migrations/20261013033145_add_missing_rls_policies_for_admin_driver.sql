/*
# Add missing RLS policies for admin/driver workflows

## What this does
Adds the missing INSERT, UPDATE, and SELECT policies that the admin and driver
panels need to function. Without these, drivers cannot update order status,
insert delivery events, or update payment records, and admins cannot insert
delivery assignments.

## Tables modified (policies only — no schema changes)

1. **orders** — Add UPDATE policy for drivers (to update status on assigned orders)
2. **delivery_assignments** — Add INSERT policy for admins
3. **delivery_events** — Add INSERT policy for drivers and admins
4. **order_status_history** — Add UPDATE policy (for correction notes)
5. **payments** — Add INSERT and UPDATE policies for admins and drivers

## Security notes
- Drivers can only UPDATE orders where they are the assigned driver.
- Drivers can only INSERT delivery_events for orders assigned to them.
- Admins can INSERT delivery_assignments and update payments.
- All policies use auth.uid() and role checks — no broad grants.
*/

-- 1. orders: Drivers can update assigned orders (for status changes during delivery)
DROP POLICY IF EXISTS "Drivers can update assigned orders" ON orders;
CREATE POLICY "Drivers can update assigned orders"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = driver_id)
WITH CHECK (auth.uid() = driver_id);

-- 2. delivery_assignments: Admins can insert delivery assignments
DROP POLICY IF EXISTS "Admins can insert delivery_assignments" ON delivery_assignments;
CREATE POLICY "Admins can insert delivery_assignments"
ON delivery_assignments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER'])
  )
);

-- 3. delivery_events: Drivers can insert events for own orders
DROP POLICY IF EXISTS "Drivers can insert own delivery_events" ON delivery_events;
CREATE POLICY "Drivers can insert own delivery_events"
ON delivery_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = driver_id);

-- 3b. delivery_events: Admins can insert events
DROP POLICY IF EXISTS "Admins can insert delivery_events" ON delivery_events;
CREATE POLICY "Admins can insert delivery_events"
ON delivery_events FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER'])
  )
);

-- 4. order_status_history: Drivers can insert status history for assigned orders
-- (Already has admin INSERT, but drivers also need it for status updates)
DROP POLICY IF EXISTS "Drivers can insert order_status_history" ON order_status_history;
CREATE POLICY "Drivers can insert order_status_history"
ON order_status_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_status_history.order_id
    AND orders.driver_id = auth.uid()
  )
);

-- 5. payments: Admins can insert payments
DROP POLICY IF EXISTS "Admins can insert payments" ON payments;
CREATE POLICY "Admins can insert payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER', 'FINANCE_MANAGER'])
  )
);

-- 5b. payments: Admins can update payments
DROP POLICY IF EXISTS "Admins can update payments" ON payments;
CREATE POLICY "Admins can update payments"
ON payments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER', 'FINANCE_MANAGER'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = ANY (ARRAY['SUPER_ADMIN', 'ADMIN', 'KITCHEN_MANAGER', 'OPERATIONS_MANAGER', 'FINANCE_MANAGER'])
  )
);

-- 5c. payments: Drivers can update payments for assigned orders (for COD collection)
DROP POLICY IF EXISTS "Drivers can update payments for assigned orders" ON payments;
CREATE POLICY "Drivers can update payments for assigned orders"
ON payments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.driver_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = payments.order_id
    AND orders.driver_id = auth.uid()
  )
);
