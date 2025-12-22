import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthProvider";
import Navbar from "./Navbar";

interface HeroNavbarProps {
  onSettings?: () => void;
}

const HeroNavbar = ({ onSettings }: HeroNavbarProps) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const navbarUser = useMemo(
    () =>
      user
        ? {
            name: user.name || user.email || "Member",
            email: user.email || "",
            avatar: user.avatar || user.avatarUrl,
          }
        : undefined,
    [user],
  );

  const handleSettings = onSettings || (() => navigate("/subscription-plans"));

  return (
    <Navbar
      isLoggedIn={!!user}
      user={navbarUser}
      onLogin={() => navigate("/login")}
      onLogout={() => logout()}
      onProfile={() => navigate("/my-deals")}
      onSettings={handleSettings}
    />
  );
};

export default HeroNavbar;
