import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { notes, insertNoteSchema } from "@acme/db/schema";
import { eq, desc } from "drizzle-orm";

export const notesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userNotes = await ctx.db
      .select()
      .from(notes)
      .where(eq(notes.userId, ctx.session.user.id))
      .orderBy(desc(notes.updatedAt));

    return userNotes;
  }),

  create: protectedProcedure
    .input(
      insertNoteSchema.pick({ title: true, content: true, categoryId: true }),
    )
    .mutation(async ({ ctx, input }) => {
      const [note] = await ctx.db
        .insert(notes)
        .values({
          ...input,
          userId: ctx.session.user.id,
        })
        .returning();

      return note;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().optional(),
        content: z.string().optional(),
        categoryId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [updatedNote] = await ctx.db
        .update(notes)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(notes.id, id))
        .returning();

      return updatedNote;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(notes).where(eq(notes.id, input.id));

      return { success: true };
    }),
});
