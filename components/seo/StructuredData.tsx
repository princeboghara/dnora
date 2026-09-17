import React from "react";

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: "DNORA",
    url: "https://dnora.luxury",
    logo: "https://dnora.luxury/images/logo.png",
    description:
      "DNORA is a modern luxury women's handbag and purse brand specializing in architectural silhouettes and Italian artisan leather.",
    sameAs: [
      "https://instagram.com/dnoralifestyle",
      "https://facebook.com/dnoralifestyle",
      "https://pinterest.com/dnoralifestyle",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
