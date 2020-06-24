import React from "react";
import { useTranslation } from "react-i18next";

export default function StatItem({
  label,
  description,
  className = "",
  i18nNamespace,
  children
}: {
  label: string;
  description?: string;
  className?: string;
  i18nNamespace?: string[];
  children: React.ReactChild;
}) {
  const { t } = useTranslation(i18nNamespace);
  return (
    <>
      <dt className={`text-nowrap ${className}`}>{t(label)}</dt>
      <dd
        className={`text-right ${className}`}
        data-tip={description ? t(description) : ""}
        data-html="true"
      >
        {children}
      </dd>
    </>
  );
}
