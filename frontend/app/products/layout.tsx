import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Showroom",
  description:
    "Browse machinery, water-treatment equipment and commercial products available through Afrilink Capital procurement.",
};

export default function ProductsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
