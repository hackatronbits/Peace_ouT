import React from "react";
import CareersPageLayout from "./layout";
import { metadata } from "./metadata";
import Script from "next/script";
import { getJobPostingSchema } from "../../../utils/seo/JsonLd";

export { metadata };

const CareersPage = () => {
  return (
    <>
      <Script
        id="careers-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getJobPostingSchema()),
        }}
      />
      <CareersPageLayout />
    </>
  );
};

export default CareersPage;
