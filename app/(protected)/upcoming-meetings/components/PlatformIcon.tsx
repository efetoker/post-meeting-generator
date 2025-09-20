// app/(protected)/upcoming-meetings/components/PlatformIcon.tsx

import { Icon } from "@iconify/react";

export const PlatformIcon = ({ platform }: { platform: string | null }) => {
  let iconName = "";
  if (platform?.includes("Google Meet")) iconName = "logos:google-meet";
  else if (platform?.includes("Zoom")) iconName = "logos:zoom";
  else if (platform?.includes("Microsoft Teams"))
    iconName = "logos:microsoft-teams";

  if (!iconName)
    return (
      <Icon
        icon="gravity-ui:link-slash"
        className="h-5 w-5 text-muted-foreground"
      />
    );
  return <Icon icon={iconName} className="h-5 w-5" />;
};
