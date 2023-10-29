import { PrismaClient } from "@prisma/client";
import { PrismaInstrumentation } from "@prisma/instrumentation";

export const prisma = new PrismaClient();

export const prismaTracing = new PrismaInstrumentation();
