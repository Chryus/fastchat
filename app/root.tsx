import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRevalidator,
  useLoaderData,
} from "@remix-run/react";
import { NextUIProvider } from "@nextui-org/react";
import { cssBundleHref } from "@remix-run/css-bundle";
import { useEffect, useState } from "react";
import createServerSupabase from "utils/supabase.server";
import { createBrowserClient } from "@supabase/auth-helpers-remix";
import chatStyles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import nextuiStyles from "~/tailwind.css";
import * as styles from "./root.css";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "db_types";

type TypedSupabaseClient = SupabaseClient<Database>;

export type SupabaseOutletContext = {
  supabase: TypedSupabaseClient;
  user: User | null;
};

export const links: LinksFunction = () => {
  // `links` returns an array of objects whose
  // properties map to the `<link />` component props
  return [
    { rel: "icon", href: "/favicon.ico" },
    { rel: "apple-touch-icon", href: "/logo192.png" },
    {
      rel: "stylesheet",
      href: chatStyles,
    },
    {
      rel: "stylesheet",
      href: nextuiStyles,
    },
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createServerSupabase({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return json({ env, session }, { headers: response.headers });
};

export default function App() {
  const { env, session } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const [supabase] = useState(() =>
    createBrowserClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
  );

  const [user, setUser] = useState<User | null>(() => session?.user || null);

  const serverAccessToken = session?.access_token;

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession?.access_token !== serverAccessToken) {
        // call loaders
        revalidator.revalidate();
        setUser(newSession?.user || null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, serverAccessToken, revalidator]);

  return (
    <html className={styles.root} lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <NextUIProvider>
          <main className="mytheme text-foreground bg-background">
            <Outlet context={{ supabase, user }} />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </main>
        </NextUIProvider>
      </body>
    </html>
  );
}
