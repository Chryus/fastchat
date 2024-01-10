import { useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { MessageList, Message } from "@chatscope/chat-ui-kit-react";
import * as styles from "./realtime-messages.css";

import type { SupabaseOutletContext } from "~/root";
import type { Database } from "db_types";

type Message = Database["public"]["Tables"]["messages"]["Row"];

export default function RealtimeMessages({
  serverMessages,
}: {
  serverMessages: Message[];
}) {
  const [messages, setMessages] = useState(serverMessages);
  const { supabase, userName } = useOutletContext<SupabaseOutletContext>();
  useEffect(() => {
    setMessages(serverMessages);
  }, [serverMessages]);

  useEffect(() => {
    const channel = supabase
      .channel("*")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMessage = payload.new as Message;

          if (!messages.find((message) => message.id === newMessage.id)) {
            setMessages([...messages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, messages, setMessages]);

  return (
    <>
      <div className={styles.root}>
        <MessageList>
          {messages.map((message) => {
            return (
              <Message
                key={message.id}
                model={{
                  message: message.content,
                  sentTime: "just now",
                  sender: userName,
                  direction: "incoming",
                  position: "single",
                }}
              />
            );
          })}
        </MessageList>
      </div>
    </>
  );
}
