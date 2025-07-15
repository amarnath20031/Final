export interface CategoryIcon {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const categoryIcons: Record<string, CategoryIcon> = {
  "Food & Dining": {
    name: "Food & Dining",
    icon: "fas fa-utensils",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  "Transport": {
    name: "Transport",
    icon: "fas fa-car",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  "Groceries": {
    name: "Groceries",
    icon: "fas fa-shopping-cart",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  "Entertainment": {
    name: "Entertainment",
    icon: "fas fa-film",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  "Health": {
    name: "Health",
    icon: "fas fa-heartbeat",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  "Shopping": {
    name: "Shopping",
    icon: "fas fa-shopping-bag",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  "Petrol": {
    name: "Petrol",
    icon: "fas fa-gas-pump",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100"
  },
  "Mobile Recharge": {
    name: "Mobile Recharge",
    icon: "fas fa-mobile-alt",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  }
};

export const getDefaultCategories = () => [
  "Food & Dining",
  "Transport", 
  "Groceries",
  "Entertainment",
  "Health",
  "Shopping",
  "Petrol",
  "Mobile Recharge"
];
