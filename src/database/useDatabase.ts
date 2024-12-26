import { environment } from "@raycast/api";
import { useSQL } from "@raycast/utils";
import path from "path";

const dbPath = path.join(environment.supportPath, "app_data.db");

export function useDatabase() {
  // Initialize the database and tables
  const { data, isLoading,  } = useSQL(
    dbPath,
    `
    -- Create Conversations table if it doesn't exist
    CREATE TABLE IF NOT EXISTS Conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Create Questions table if it doesn't exist
    CREATE TABLE IF NOT EXISTS Questions (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES Conversations(id)
    );
    `
  );

  return { data, isLoading };
}
