CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = (SELECT auth.uid())
      AND role IN (
        'SUPER_ADMIN',
        'ADMIN',
        'KITCHEN_MANAGER',
        'OPERATIONS_MANAGER',
        'SUPPORT_AGENT',
        'FINANCE_MANAGER'
      )
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id AND role = 'CUSTOMER')
  WITH CHECK (auth.uid() = id AND role = 'CUSTOMER');

DROP POLICY IF EXISTS "Admins can update user profiles" ON public.users;
CREATE POLICY "Admins can update user profiles"
  ON public.users FOR UPDATE TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role = 'CUSTOMER');

DO $$
BEGIN
  IF to_regclass('public.driver_profiles') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Drivers and admins can read driver profiles" ON public.driver_profiles';
    EXECUTE 'CREATE POLICY "Drivers and admins can read driver profiles"
      ON public.driver_profiles FOR SELECT TO authenticated
      USING (auth.uid() = user_id OR public.is_admin_user())';

    EXECUTE 'DROP POLICY IF EXISTS "Drivers can update their online status" ON public.driver_profiles';
    EXECUTE 'CREATE POLICY "Drivers can update their online status"
      ON public.driver_profiles FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'REVOKE UPDATE ON public.driver_profiles FROM authenticated';
    EXECUTE 'GRANT UPDATE (is_online, status, updated_at)
      ON public.driver_profiles TO authenticated';
  END IF;

  IF to_regclass('public.orders') IS NOT NULL
     AND to_regclass('public.delivery_events') IS NOT NULL
     AND to_regclass('public.driver_profiles') IS NOT NULL THEN
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_events_one_driver_delivery
      ON public.delivery_events (order_id, driver_id)
      WHERE event_type = ''DELIVERED''';

    EXECUTE $function$
      CREATE OR REPLACE FUNCTION public.record_driver_delivery(p_order_id uuid)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = ''
      AS $body$
      DECLARE
        inserted_event_count integer;
      BEGIN
        IF auth.uid() IS NULL OR NOT EXISTS (
          SELECT 1
          FROM public.users
          WHERE id = auth.uid() AND role = 'DRIVER'
        ) THEN
          RAISE EXCEPTION 'Only the assigned driver can record a delivery';
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM public.orders
          WHERE id = p_order_id
            AND driver_id = auth.uid()
            AND status = 'DELIVERED'
        ) THEN
          RAISE EXCEPTION 'Order is not a completed delivery assigned to this driver';
        END IF;

        INSERT INTO public.delivery_events (order_id, driver_id, event_type)
        VALUES (p_order_id, auth.uid(), 'DELIVERED')
        ON CONFLICT (order_id, driver_id) WHERE event_type = 'DELIVERED'
        DO NOTHING;
        GET DIAGNOSTICS inserted_event_count = ROW_COUNT;

        IF inserted_event_count = 1 THEN
          UPDATE public.driver_profiles
          SET total_deliveries = COALESCE(total_deliveries, 0) + 1
          WHERE user_id = auth.uid();

          IF NOT FOUND THEN
            RAISE EXCEPTION 'Driver profile not found';
          END IF;
        END IF;
      END;
      $body$;
    $function$;

    EXECUTE 'REVOKE ALL ON FUNCTION public.record_driver_delivery(uuid) FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.record_driver_delivery(uuid) TO authenticated';
  END IF;
END;
$$;
