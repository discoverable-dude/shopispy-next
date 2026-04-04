import { getSupabaseClient } from "@/lib/supabase/client";

interface SlackNotificationData {
  type: 'price_drop' | 'new_product' | 'store_added' | 'alert_setup' | 'system_event' | 'contact_form' | 'new_signup' | 'new_subscription' | 'scrape_completed' | 'admin_action';
  title: string;
  message: string;
  data?: {
    store_name?: string;
    store_url?: string;
    product_title?: string;
    old_price?: string;
    new_price?: string;
    product_count?: number;
    user_email?: string;
    subscription_tier?: string;
  };
  severity?: 'info' | 'warning' | 'error' | 'success';
  user_id?: string;
}

export const sendSlackNotification = async (notification: SlackNotificationData) => {
  try {
    const { data, error } = await getSupabaseClient().functions.invoke('send-slack-notification', {
      body: notification
    });

    if (error) {
      console.error('Error sending Slack notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Convenience functions for specific notification types
export const notifyPriceDrop = async (
  storeName: string,
  storeUrl: string,
  productTitle: string,
  oldPrice: string,
  newPrice: string,
  userId?: string
) => {
  return sendSlackNotification({
    type: 'price_drop',
    title: 'Price Drop Detected',
    message: `The price of "${productTitle}" has dropped from ${oldPrice} to ${newPrice} at ${storeName}`,
    data: {
      store_name: storeName,
      store_url: storeUrl,
      product_title: productTitle,
      old_price: oldPrice,
      new_price: newPrice
    },
    severity: 'success',
    user_id: userId
  });
};

export const notifyNewProduct = async (
  storeName: string,
  storeUrl: string,
  productTitle: string,
  userId?: string
) => {
  return sendSlackNotification({
    type: 'new_product',
    title: 'New Product Added',
    message: `A new product "${productTitle}" has been added to ${storeName}`,
    data: {
      store_name: storeName,
      store_url: storeUrl,
      product_title: productTitle
    },
    severity: 'info',
    user_id: userId
  });
};

export const notifyStoreAdded = async (
  storeName: string,
  storeUrl: string,
  productCount: number,
  userEmail: string,
  userId?: string
) => {
  return sendSlackNotification({
    type: 'store_added',
    title: 'New Store Added to Monitoring',
    message: `${storeName} has been added to competitor monitoring with ${productCount} products found`,
    data: {
      store_name: storeName,
      store_url: storeUrl,
      product_count: productCount,
      user_email: userEmail
    },
    severity: 'info',
    user_id: userId
  });
};

export const notifyAlertSetup = async (
  storeName: string,
  storeUrl: string,
  userEmail: string,
  alertType: string,
  userId?: string
) => {
  return sendSlackNotification({
    type: 'alert_setup',
    title: 'Alert Configuration Updated',
    message: `${userEmail} has configured ${alertType} alerts for ${storeName}`,
    data: {
      store_name: storeName,
      store_url: storeUrl,
      user_email: userEmail
    },
    severity: 'info',
    user_id: userId
  });
};

export const notifySystemEvent = async (
  title: string,
  message: string,
  userEmail?: string,
  subscriptionTier?: string,
  severity: 'info' | 'warning' | 'error' | 'success' = 'info',
  userId?: string
) => {
  return sendSlackNotification({
    type: 'system_event',
    title,
    message,
    data: {
      user_email: userEmail,
      subscription_tier: subscriptionTier
    },
    severity,
    user_id: userId
  });
};