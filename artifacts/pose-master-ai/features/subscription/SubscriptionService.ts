// Placeholder for Subscription and Billing management
export const SubscriptionService = {
  async getProducts(): Promise<any[]> {
    // TODO: Implement RevenueCat or direct Google Play Billing / App Store Connect
    return [
      { id: "pro_monthly", price: "$4.99" },
      { id: "pro_yearly", price: "$29.99" }
    ];
  },

  async purchaseProduct(productId: string): Promise<boolean> {
    console.log("Purchasing product:", productId);
    return true;
  },

  async restorePurchases(): Promise<boolean> {
    console.log("Restoring purchases...");
    return true;
  }
};
