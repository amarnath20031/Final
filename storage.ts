import {
  users,
  budgets,
  expenses,
  categories,
  type User,
  type UpsertUser,
  type Budget,
  type Expense,
  type Category,
  type InsertBudget,
  type InsertExpense,
  type InsertCategory,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Budget operations
  getBudget(userId: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(userId: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  
  // Expense operations
  getExpenses(userId: string, limit?: number): Promise<Expense[]>;
  getExpensesByCategory(userId: string, category: string): Promise<Expense[]>;
  getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Analytics
  getTotalSpentByCategory(userId: string, startDate: Date, endDate: Date): Promise<Record<string, number>>;
  getTotalSpent(userId: string, startDate: Date, endDate: Date): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Budget operations
  async getBudget(userId: string): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.userId, userId));
    return budget;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
    return budget;
  }

  async updateBudget(userId: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [budget] = await db
      .update(budgets)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(budgets.userId, userId))
      .returning();
    return budget;
  }

  // Expense operations
  async getExpenses(userId: string, limit?: number): Promise<Expense[]> {
    const query = db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(expenses.date);
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .where(eq(expenses.category, category))
      .orderBy(expenses.date);
  }

  async getExpensesByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(expenses.date);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Analytics
  async getTotalSpentByCategory(userId: string, startDate: Date, endDate: Date): Promise<Record<string, number>> {
    const userExpenses = await this.getExpensesByDateRange(userId, startDate, endDate);
    const categoryTotals: Record<string, number> = {};
    
    userExpenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount;
    });
    
    return categoryTotals;
  }

  async getTotalSpent(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const userExpenses = await this.getExpensesByDateRange(userId, startDate, endDate);
    return userExpenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  }
}

export const storage = new DatabaseStorage();
