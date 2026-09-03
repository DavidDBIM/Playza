// Admin notifications sometimes carry a destination link hidden inside the
// content string as a "[PLAYZA_LINK]https://..." suffix (see the admin
// SendNoti form). This centralizes the parsing so every place that renders
// a notification — the full-screen banner and the notification center —
// strips it the same way instead of re-implementing the split.
export function parseNotificationLink(content?: string | null): {
  text: string;
  link?: string;
} {
  if (!content) return { text: "" };

  const marker = "[PLAYZA_LINK]";
  const idx = content.indexOf(marker);
  if (idx === -1) return { text: content };

  return {
    text: content.slice(0, idx).trim(),
    link: content.slice(idx + marker.length).trim(),
  };
}

// Where an admin notification should take the user when tapped — the
// explicit link_url field wins, falling back to a link hidden in content.
export function resolveNotificationLink(notification: {
  link_url?: string | null;
  content?: string | null;
}): string | undefined {
  if (notification.link_url) return notification.link_url;
  return parseNotificationLink(notification.content).link;
}