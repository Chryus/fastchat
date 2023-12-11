import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import createServerSupabase from "utils/supabase.server";
import Login from "~/components/login";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });
  const { data } = await supabase.from("messages").select();
  return json({ messages: data ?? [] }, { headers: response.headers });
}; 

export default function Index() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <Login />
      <pre>{JSON.stringify(data, null, 2)} </pre>
    </>
  );
}
