import { PowerSyncDatabase } from "@powersync/react-native";
import {
  Column,
  ColumnType,
  Index,
  Schema,
  Table,
} from "@powersync/react-native";

const AppSchema = new Schema([
  new Table({
    name: "users",
    columns: [
      new Column({ name: "email", type: ColumnType.TEXT }),
      new Column({ name: "name", type: ColumnType.TEXT }),
      new Column({ name: "image", type: ColumnType.TEXT }),
      new Column({ name: "created_at", type: ColumnType.TEXT }),
      new Column({ name: "updated_at", type: ColumnType.TEXT }),
    ],
  }),
  new Table({
    name: "categories",
    columns: [
      new Column({ name: "name", type: ColumnType.TEXT }),
      new Column({ name: "user_id", type: ColumnType.TEXT }),
      new Column({ name: "created_at", type: ColumnType.TEXT }),
    ],
    indexes: [new Index({ name: "user_categories", columns: ["user_id"] })],
  }),
  new Table({
    name: "notes",
    columns: [
      new Column({ name: "title", type: ColumnType.TEXT }),
      new Column({ name: "content", type: ColumnType.TEXT }),
      new Column({ name: "category_id", type: ColumnType.TEXT }),
      new Column({ name: "user_id", type: ColumnType.TEXT }),
      new Column({ name: "created_at", type: ColumnType.TEXT }),
      new Column({ name: "updated_at", type: ColumnType.TEXT }),
    ],
    indexes: [
      new Index({ name: "user_notes", columns: ["user_id"] }),
      new Index({ name: "category_notes", columns: ["category_id"] }),
    ],
  }),
]);

export let powerSync: PowerSyncDatabase;

export const initPowerSync = async (token: string) => {
  powerSync = new PowerSyncDatabase({
    schema: AppSchema,
    database: {
      dbFilename: "everynote.sqlite",
    },
  });
  // Set the token using the appropriate method if required by the library
  // Example: await powerSync.setToken(token);

  await powerSync.init();
};
