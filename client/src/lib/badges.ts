export interface BadgeInfo {
  tier: string;
  title: string;
  icon: string;
  className: string;
}

export function getBadgeInfo(postCount: number): BadgeInfo {
  if (postCount >= 50) {
    return {
      tier: "gold",
      title: `Gold Contributor (${postCount} posts)`,
      icon: "fas fa-trophy",
      className: "text-yellow-400",
    };
  } else if (postCount >= 25) {
    return {
      tier: "silver",
      title: `Silver Contributor (${postCount} posts)`,
      icon: "fas fa-award",
      className: "text-gray-300",
    };
  } else if (postCount >= 10) {
    return {
      tier: "bronze",
      title: `Bronze Contributor (${postCount} posts)`,
      icon: "fas fa-star",
      className: "text-orange-400",
    };
  } else if (postCount >= 5) {
    return {
      tier: "active",
      title: `Active Member (${postCount} posts)`,
      icon: "fas fa-thumbs-up",
      className: "text-blue-400",
    };
  } else {
    return {
      tier: "new",
      title: `New Member (${postCount} posts)`,
      icon: "fas fa-user",
      className: "text-gray-400",
    };
  }
}
