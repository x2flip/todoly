import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) return;
    return ctx.prisma.todo.findMany({ where: { userId } });
  }),
  createNewTodo: publicProcedure
    .input(z.object({ task: z.string() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return;
      return ctx.prisma.todo.create({
        data: { userId, task: input.task, active: true },
      });
    }),
  inactivateTask: publicProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return;
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),
  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return;
      return ctx.prisma.todo.delete({ where: { id: input.id } });
    }),
  changeTodo: publicProcedure
    .input(z.object({ id: z.number(), task: z.string() }))
    .mutation(({ input, ctx }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return;
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { task: input.task },
      });
    }),
});
