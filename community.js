const COMMUNITY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const rememberForumCommunity = (locale) => {
  const normalizedLocale = locale === "dk" ? "da" : locale;
  if (!["pl", "da", "en"].includes(normalizedLocale)) {
    return;
  }

  const domain = window.location.hostname.endsWith("ha-expert.com")
    ? "; Domain=.ha-expert.com"
    : "";
  document.cookie = `ha_community=${normalizedLocale}; Max-Age=${COMMUNITY_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${domain}${
    window.location.protocol === "https:" ? "; Secure" : ""
  }`;
};

document.querySelectorAll(".lang-switch .lang-btn").forEach((link) => {
  link.addEventListener("click", () => {
    const targetPath = new URL(link.href, window.location.href).pathname;
    const locale = targetPath.split("/").filter(Boolean)[0];
    rememberForumCommunity(locale);
  });
});

document.querySelectorAll(".forum-community-link").forEach((link) => {
  link.addEventListener("click", () => {
    const locale = document.documentElement.lang.split("-")[0];
    rememberForumCommunity(locale);
  });
});
