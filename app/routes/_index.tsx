import { Form, useLoaderData } from "@remix-run/react";
import createServerSupabase from "utils/supabase.server";
import { json } from "@remix-run/node";
import Login from "../components/login";
import RealtimeMessages from "../components/realtime-messages";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Button, Input } from "@nextui-org/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });
  const { message } = Object.fromEntries(await request.formData());

  const { error } = await supabase
    .from("messages")
    .insert({ content: String(message) });

  if (error) {
    console.log(error);
  }

  return json(null, { headers: response.headers });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response();
  const supabase = createServerSupabase({ request, response });

  const { data } = await supabase.from("messages").select();

  return json({ messages: data ?? [] }, { headers: response.headers });
};

export default function Index() {
  const { messages } = useLoaderData<typeof loader>();

  return (
    <>
      <Login />
      <RealtimeMessages serverMessages={messages} />
      <div
        style={{ backgroundColor: "black", padding: "10px 0" }}
        className="flex w-full flex-wrap md:flex-nowrap gap-4"
      >
        <Form
          style={{
            alignItems: "center",
            paddingLeft: "15px",
          }}
          className="inline-flex flex-center gap-4"
          method="post"
        >
          <Input
            name="message"
            color="primary"
            type="message"
            placeholder="Enter your message"
          />
          <Button color="primary" type="submit">
            Send
          </Button>
        </Form>
      </div>
    </>
  );
}
