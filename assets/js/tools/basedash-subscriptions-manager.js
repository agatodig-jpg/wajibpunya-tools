async function executeTool(inputs) {
    try {
      const dashboard_url = inputs.dashboard_url;
      const schedule_frequency = inputs.schedule_frequency || 'daily';
      const notification_endpoint = inputs.notification_endpoint || '';

      if (!dashboard_url || typeof dashboard_url !== "string") throw new Error("Invalid or missing Dashboard URL.");
      
      // Validate URL structure (must start with http/https)
      if (!/^https?:\/\//.test(dashboard_url)) {
        throw new Error("Dashboard URL must be a valid HTTP(S) address.");
      }

      const now = new Date();
      let nextDeliveryTimestamp;
      
      // Calculate next delivery timestamp based on frequency
      if (schedule_frequency.toLowerCase() === "hourly") {
        nextDeliveryTimestamp = new Date(now.getTime() + 3600 * 1000).toISOString();
      } else if (schedule_frequency.toLowerCase() === "daily") {
        nextDeliveryTimestamp = new Date(now.getTime() + (24 * 3600) * 1000).toISOString();
      } else if (schedule_frequency.toLowerCase() === "weekly") {
        // Ensure it's always the coming week to avoid same-day logic confusion in tool context
        nextDeliveryTimestamp = new Date(now.getTime() + (7 * 24 * 3600) * 1000).toISOString();
      } else {
        throw new Error("Frequency must be hourly, daily, or weekly.");
      }

      // Generate embed configuration snippet for client-side rendering
      const configSnippet = {
        targetUrl: dashboard_url,
        widgetVersion: "1.0",
        scheduledUpdateAt: nextDeliveryTimestamp,
        refreshInterval: schedule_frequency + "_cycle"
      };

      let notificationLink;
      // Construct notification links (mailto or generic endpoint)
      if (notification_endpoint.includes("@")) {
         const mailSubject = encodeURIComponent("Dashboard Subscription Alert");
         const mailBody = encodeURIComponent(`New Dashboard Check scheduled for ${nextDeliveryTimestamp}\`);
         notificationLink = `mailto:${encodeURIComponent(notification_endpoint)}?subject=${mailSubject}&body=${mailBody}`;
      } else if (notification_endpoint.length > 0) {
        // Assume webhook or slack-style link pattern
        const encodedEndpoint = encodeURIComponent(notification_endpoint);
        notificationLink = `${encodedEndpoint}?subscribed=true&target=${encodeURIComponent(dashboard_url)}&event=delivery`;
      }

      return { success: true, result: { nextDeliveryTimestamp, embedConfigSnippet: JSON.stringify(configSnippet), alertNotificationLink: notificationLink || "No endpoint configured", status: "Active" } }; 
    } catch (error) {
      console.warn(error.message);
      return { success: false, error: error.message, result: null };
    }
  }