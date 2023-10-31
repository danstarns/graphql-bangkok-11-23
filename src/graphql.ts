import { makeExecutableSchema } from "@graphql-tools/schema";
import { prismaTracing } from "./prisma";
import { createYoga } from "graphql-yoga";
import {
  GraphQLOTELContext,
  traceSchema,
} from "@graphql-debugger/trace-schema";
import { resolvers } from "./resolvers";

const typeDefs = /* GraphQL */ `
  type User {
    id: ID!
    email: String!
  }

  type Document {
    id: ID!
    title: String!
    content: String!
    author: User!
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
