import { makeExecutableSchema } from "@graphql-tools/schema";
import { prisma, prismaTracing } from "./prisma";
import { createYoga } from "graphql-yoga";
import {
  GraphQLOTELContext,
  traceSchema,
} from "@graphql-debugger/trace-schema";

const typeDefs = /* GraphQL */ `
  type Document {
    id: ID!
    title: String!
    content: String!
    authorId: String!
  }

  type Mutation {
    signup(email: String!, password: String!): String!
    login(email: String!, password: String!): String!
    createDocument(title: String!, content: String!): Document!
  }

  type Query {
    documents: [String!]!
    document(title: String!): Document
  }
`;

const resolvers = {
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
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const tracedSchema = traceSchema({
  schema,
  instrumentations: [prismaTracing],
});

export const yoga = createYoga({
  schema: tracedSchema,
  context: (req) => ({
    userid: req.request.headers.get("userid"),
    GraphQLOTELContext: new GraphQLOTELContext({
      includeResult: true,
      includeVariables: true,
      includeContext: true,
    }),
  }),
});
