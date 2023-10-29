import express from "express";
import { yoga } from "./graphql";
import { graphqlDebugger } from "@graphql-debugger/plugin-express";

const app = express();
app.use(express.json());
app.use(graphqlDebugger());

app.use(yoga.graphqlEndpoint, yoga);

app.listen(4000, () => {
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
});
