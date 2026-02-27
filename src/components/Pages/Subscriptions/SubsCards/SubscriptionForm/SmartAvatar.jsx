import React, { useEffect, useMemo, useState } from "react";
import LetterAvatar from "./LetterAvatar";
import { resolveDomain } from "./domainMap";
import "./avatar.css";

export default function SmartAvatar({ name, size = 48 }) {
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const clientId = process.env.REACT_APP_BRANDFETCH_CLIENT_ID || "";

  const normalizedDomain = useMemo(() => {
    return resolveDomain(name) || "";
  }, [name]);

  const logoSrc = useMemo(() => {
    if (!normalizedDomain) return "";
    const query = clientId ? `?c=${encodeURIComponent(clientId)}` : "";
    return `https://cdn.brandfetch.io/domain/${normalizedDomain}/w/400/h/400${query}`;
  }, [normalizedDomain, clientId]);

  useEffect(() => {
    setLoadError(false);
    setIsLoaded(false);
  }, [logoSrc]);

  useEffect(() => {
    if (!logoSrc) return undefined;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setLoadError(true);
    img.src = logoSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [logoSrc]);

  const safeName = name ? String(name).trim() : "";

  if (!logoSrc || loadError) {
    return <LetterAvatar name={safeName} size={size} />;
  }

  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      <img
        src={logoSrc}
        alt={safeName || "Subscription logo"}
        width={size}
        height={size}
        loading="lazy"
        className="avatar-img smart-avatar"
        onLoad={() => setIsLoaded(true)}
        onError={() => setLoadError(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </div>
  );
}
