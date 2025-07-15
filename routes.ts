import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBudgetSchema, insertExpenseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Budget routes
  app.get("/api/budget", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budget = await storage.getBudget(userId);
      res.json(budget);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/budget", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const budgetData = insertBudgetSchema.parse({ ...req.body, userId });
      const budget = await storage.createBudget(budgetData);
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create budget" });
      }
    }
  });

  app.put("/api/budget", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(userId, updates);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid budget data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update budget" });
      }
    }
  });

  // Expense routes
  app.get("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const expenses = await storage.getExpenses(userId, limit);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/category/:category", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { category } = req.params;
      const expenses = await storage.getExpensesByCategory(userId, category);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses by category" });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/spending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period = "month" } = req.query;
      const now = new Date();
      let startDate: Date;
      
      if (period === "day") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      const [totalSpent, categorySpending] = await Promise.all([
        storage.getTotalSpent(userId, startDate, now),
        storage.getTotalSpentByCategory(userId, startDate, now)
      ]);
      
      res.json({ totalSpent, categorySpending, period, startDate, endDate: now });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spending analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
