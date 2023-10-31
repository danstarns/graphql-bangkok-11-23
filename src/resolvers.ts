import { prisma } from "./prisma";

export const resolvers = {
  Mutation: {
    async signup(_, { email, password }) {
      const user = await prisma.user.create({
        data: {
          email,
          password,
        },
      });

      return user.id;
    },
    async login(_, { email, password }) {
      const user = await prisma.user.findUnique({
        where: {
          email,
          password,
        },
      });

      if (!user) {
        throw new Error("Forbidden");
      }

      return user.id;
    },
    async createDocument(_, { title, content }, { userid }) {
      if (!userid) {
        throw new Error("Forbidden");
      }

      const document = await prisma.document.create({
        data: {
          title,
          content,
          authorId: userid,
        },
      });

      return document;
    },
  },
  Query: {
    async documents() {
      const documents = await prisma.document.findMany({
        select: {
          title: true,
        },
      });

      return documents.map((document) => document.title);
    },
    async document(_, { title }, { userid }) {
      const document = await prisma.document.findUnique({
        where: {
          title,
        },
      });

      if (document?.authorId !== userid) {
        throw new Error("Forbidden");
      }

      return document;
    },
  },
  Document: {
    async author(parent) {
      const author = await prisma.document
        .findUnique({
          where: {
            id: parent.id,
          },
        })
        .author();

      return author;
    },
  },
};
