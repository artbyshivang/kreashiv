export const isAllowedEmail = (email) => {
  if (!email) return false;
  
  const allowedDomains = [
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "yahoo.com",
    "icloud.com",
    "proton.me",
    "zohomail.com",
    "aol.com",
    "fastmail.com",
    "gmx.com",
    "tuta.com"
  ];

  const emailParts = email.trim().toLowerCase().split("@");
  
  if (emailParts.length !== 2) return false;
  
  const domain = emailParts[1];
  return allowedDomains.includes(domain);
};
