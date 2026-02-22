import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../context/ProfileContext";

export default function AuthProfileBootstrap({ children }) {
  const { profile: authProfile, initializing } = useAuth();
  const { profile, setProfile, loaded, setLoaded } = useProfile();

  useEffect(() => {
    if (initializing) return;

    if (!authProfile) {
      if (profile !== null || loaded) {
        setProfile(null);
        setLoaded(false);
      }
      return;
    }

    setProfile(authProfile);
    setLoaded(true);
  }, [authProfile, initializing, loaded, profile, setLoaded, setProfile]);

  return children;
}
