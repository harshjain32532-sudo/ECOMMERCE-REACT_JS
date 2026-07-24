/**
 * Order Tracking Service
 * Handles email notifications and templates for order status updates
 */

// Email templates for different order statuses
const emailTemplates = {
    pending: (orderData) => ({
        subject: `Order Received - Order #${orderData._id}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order Received ✓</h1>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 20px;">
            <p style="margin: 0; color: #2c3e50; font-weight: bold;">Order ID: ${orderData._id}</p>
            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px;">Placed on ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr style="border-bottom: 1px solid #ddd;">
              <th style="text-align: left; padding: 10px; color: #666;">Product</th>
              <th style="text-align: center; padding: 10px; color: #666;">Qty</th>
              <th style="text-align: right; padding: 10px; color: #666;">Price</th>
            </tr>
            ${orderData.items?.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; color: #333;">${item.name}</td>
                <td style="text-align: center; padding: 10px; color: #666;">${item.quantity}</td>
                <td style="text-align: right; padding: 10px; color: #666;">₹${item.price?.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 5px 0; text-align: right; color: #666;">Subtotal: <strong>₹${orderData.total?.toFixed(2)}</strong></p>
            <p style="margin: 5px 0; text-align: right; color: #666;">Shipping: <strong>Free</strong></p>
            <p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #ddd; text-align: right; font-size: 18px; color: #27ae60;"><strong>Total: ₹${orderData.total?.toFixed(2)}</strong></p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">Shipping Address</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px; color: #666; line-height: 1.6;">
            <p style="margin: 5px 0;"><strong>${orderData.shippingAddress?.name}</strong></p>
            <p style="margin: 5px 0;">${orderData.shippingAddress?.line1}</p>
            <p style="margin: 5px 0;">${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state} ${orderData.shippingAddress?.zip}</p>
            <p style="margin: 5px 0; margin-top: 10px;">Phone: ${orderData.shippingAddress?.phone}</p>
          </div>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            Your order is being prepared. You'll receive updates as it progresses through our fulfillment center.
          </p>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
            <p style="margin: 5px 0;">Questions? Reply to this email or contact support.</p>
          </div>
        </div>
      </div>
    `
    }),

    confirmed: (orderData) => ({
        subject: `Order Confirmed - Order #${orderData._id}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order Confirmed ✓</h1>
          
          <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin-bottom: 20px;">
            <p style="margin: 0; color: #155724; font-weight: bold;">✓ Payment Received</p>
            <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">Your payment has been successfully processed</p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">What's Next?</h3>
          <ol style="color: #666; line-height: 2;">
            <li>Our team is carefully preparing your order</li>
            <li>You'll receive a shipping notification once it's dispatched</li>
            <li>Track your package in real-time</li>
          </ol>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            <strong>Order ID:</strong> ${orderData._id}
          </p>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
            <p style="margin: 5px 0;">Thank you for shopping with us!</p>
          </div>
        </div>
      </div>
    `
    }),

    processing: (orderData) => ({
        subject: `Order Processing - Order #${orderData._id}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order is Being Processed 📦</h1>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <p style="margin: 0; color: #856404; font-weight: bold;">⏳ Processing Your Order</p>
            <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">We're picking and packing your items</p>
          </div>

          <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
            Your order is currently being picked from our warehouse and carefully packed. We'll send you a tracking number as soon as it ships!
          </p>

          <h3 style="color: #333; margin-bottom: 10px;">Timeline</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #666;">Order Received</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #666;">Payment Confirmed</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #ffc107; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 14px;">⏳</span>
              <span style="color: #333; font-weight: bold;">Processing</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background-color: #ddd; color: #999; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">→</span>
              <span style="color: #999;">Shipped</span>
            </div>
          </div>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            <strong>Order ID:</strong> ${orderData._id}
          </p>
        </div>
      </div>
    `
    }),

    shipped: (orderData) => ({
        subject: `Order Shipped! - Order #${orderData._id} - Tracking #${orderData.trackingNumber}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order Shipped! 🚚</h1>
          
          <div style="background-color: #d1ecf1; padding: 15px; border-left: 4px solid #0c5460; margin-bottom: 20px;">
            <p style="margin: 0; color: #0c5460; font-weight: bold;">Your package is on its way!</p>
            <p style="margin: 5px 0 0 0; color: #0c5460; font-size: 14px;">Tracking number: <strong>${orderData.trackingNumber || 'N/A'}</strong></p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">Expected Delivery</h3>
          <p style="color: #666; margin-bottom: 20px; font-size: 16px;">
            <strong>${orderData.estimatedDelivery ? new Date(orderData.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Within 5-7 business days'}</strong>
          </p>

          <h3 style="color: #333; margin-bottom: 10px;">Track Your Order</h3>
          <p style="color: #666; margin-bottom: 15px;">
            You can track your shipment using the tracking number above on our website or the carrier's website.
          </p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; color: #666;"><strong>Tracking Number:</strong> ${orderData.trackingNumber || 'Coming soon'}</p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">Timeline</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #666;">Order Received</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #666;">Payment Confirmed</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #666;">Processing</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background-color: #28a745; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold;">✓</span>
              <span style="color: #333; font-weight: bold;">Shipped</span>
            </div>
          </div>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            Excited? Track your order in real-time!
          </p>
        </div>
      </div>
    `
    }),

    delivered: (orderData) => ({
        subject: `Order Delivered! - Order #${orderData._id}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order Delivered! 🎉</h1>
          
          <div style="background-color: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin-bottom: 20px;">
            <p style="margin: 0; color: #155724; font-weight: bold;">✓ Successfully Delivered</p>
            <p style="margin: 5px 0 0 0; color: #155724; font-size: 14px;">Your package has been delivered</p>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">Thank You!</h3>
          <p style="color: #666; margin-bottom: 20px; line-height: 1.8;">
            We appreciate your business! We hope you love your purchase. If you have any questions or need help, please don't hesitate to reach out.
          </p>

          <h3 style="color: #333; margin-bottom: 10px;">Share Your Feedback</h3>
          <p style="color: #666; margin-bottom: 15px;">
            Your feedback helps us improve. Share your thoughts on your purchase!
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="#" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Write a Review</a>
          </div>

          <h3 style="color: #333; margin-bottom: 10px;">What's Next?</h3>
          <ul style="color: #666; line-height: 2;">
            <li>Check your order details</li>
            <li>Leave a review to help other customers</li>
            <li>Browse similar products</li>
          </ul>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            <strong>Order ID:</strong> ${orderData._id}
          </p>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 12px;">
            <p style="margin: 5px 0;">Have questions? Contact our support team anytime.</p>
          </div>
        </div>
      </div>
    `
    }),

    cancelled: (orderData) => ({
        subject: `Order Cancelled - Order #${orderData._id}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Order Cancelled</h1>
          
          <div style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #e74c3c; margin-bottom: 20px;">
            <p style="margin: 0; color: #721c24; font-weight: bold;">✗ Order Cancelled</p>
            <p style="margin: 5px 0 0 0; color: #721c24; font-size: 14px;">Your order has been cancelled</p>
          </div>

          <p style="color: #666; margin-bottom: 20px; line-height: 1.8;">
            Your order has been cancelled. If you paid for this order, a refund will be processed within 5-7 business days.
          </p>

          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderData._id}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Total Amount:</strong> ₹${orderData.total?.toFixed(2)}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Status:</strong> Cancelled</p>
          </div>

          <p style="color: #7f8c8d; text-align: center; margin-top: 30px; font-size: 14px;">
            If you have questions about this cancellation, please contact our support team.
          </p>
        </div>
      </div>
    `
    })
};

export const getOrderEmailTemplate = (status, orderData) => {
    const template = emailTemplates[status];
    return template ? template(orderData) : null;
};

export const getStatusChangeMessage = (oldStatus, newStatus) => {
    const messages = {
        'pending->confirmed': '✓ Payment confirmed and order is being prepared',
        'confirmed->processing': '📦 Order is being packed',
        'processing->shipped': '🚚 Order shipped with tracking',
        'shipped->delivered': '✓ Order delivered successfully',
        'pending->cancelled': '✗ Order cancelled',
        'confirmed->cancelled': '✗ Order cancelled',
        'processing->cancelled': '✗ Order cancelled'
    };
    return messages[`${oldStatus}->${newStatus}`] || 'Order status updated';
};

export const formatOrderForNotification = (order) => {
    return {
        id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        total: order.total,
        userEmail: order.userEmail,
        shippingAddress: order.shippingAddress
    };
};
