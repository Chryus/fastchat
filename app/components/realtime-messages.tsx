import { useEffect, useState } from "react";
import { MessageList, Message, Avatar } from "@chatscope/chat-ui-kit-react";
import { useOutletContext } from "@remix-run/react";
import * as styles from "./realtime-messages.css";

import type { SupabaseOutletContext } from "~/root";
import type { Database } from "db_types";

type MessageType = Database["public"]["Tables"]["messages"]["Row"];

interface RealtimeMessagesProps {
  serverMessages: MessageType[];
}

export default function RealtimeMessages({
  serverMessages,
}: RealtimeMessagesProps): JSX.Element {
  const [messages, setMessages] = useState<MessageType[]>(serverMessages);
  const { supabase, user } = useOutletContext<SupabaseOutletContext>();

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
          const newMessage = payload.new as MessageType;

          if (!messages.find((message) => message.id === newMessage.id)) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, messages, setMessages]);

  return (
    <div className={styles.root}>
      <MessageList className={styles.messageList}>
        {messages.map((message) => (
          <Message
            key={message.id}
            model={{
              message: message.content,
              sentTime: "just now",
              sender: user.user_metadata.name,
              direction: "incoming",
              position: "single",
            }}
          >
            <Avatar
              src={user.user_metadata.avatar_url}
              name={user.user_metadata.name}
            />
          </Message>
        ))}
      </MessageList>
    </div>
  );
}
