import { createContext, useContext, useState } from "react";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loaded, setLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
