import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import supabase from "utils/supabase.server";
import Login from "~/components/login";

export const loader = async ({}: LoaderFunction) => {
  const { data } = await supabase.from("messages").select();
  return { data };
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
