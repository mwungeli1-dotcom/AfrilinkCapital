import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request a Quotation",
  description:
    "Tell Afrilink Capital what your business needs and request sourcing, importation and delivery support.",
};

export default function RequestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
