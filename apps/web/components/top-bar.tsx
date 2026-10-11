import { BrandMark } from "./brand";
import { ProfileMenu } from "./profile-menu";

// Slim sticky bar on every page: brand left, profile right (when signed in).
export function TopBar() {
  return (
    <header className="mc-topbar">
      <a href="/" className="mc-topbar-brand" aria-label="MedConz home">
        <BrandMark size={30} />
        <span>MedConz</span>
      </a>
      <ProfileMenu />
    </header>
  );
}
