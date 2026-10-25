"use client";

import { Product } from "@/types/product.type";
import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const isInStock = Number(product?.stock ?? 0) > 0;

  const imageUrl =
    product?.imageUrl?.trim() || FALLBACK_IMAGE;

  const price = Number(product?.price ?? 0);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/60">
      {/* Product image */}
      <Link
        href={`/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/4.3] overflow-hidden bg-neutral-50"
      >
        <Image
          src={imageUrl}
          alt={product?.name || "Product image"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Stock label */}
        {!isInStock && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm backdrop-blur">
            Sold out
          </span>
        )}
      </Link>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          {product?.category?.name || "Collection"}
        </span>

        <Link
          href={`/${product.id}`}
          className="w-fit max-w-full"
        >
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-neutral-900 transition-colors hover:text-neutral-600">
            {product?.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-500">
          {product?.description || "Discover more about this product."}
        </p>

        {/* Price and availability */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-neutral-100 pt-4">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
              Price
            </p>

            <p className="text-xl font-bold tracking-tight text-neutral-900">
              ${price.toFixed(2)}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${
              isInStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-neutral-100 text-neutral-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isInStock
                  ? "bg-emerald-500"
                  : "bg-neutral-400"
              }`}
            />
            {isInStock ? "In stock" : "Out of stock"}
          </span>
        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={!isInStock}
          onClick={() => onAddToCart?.(product)}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neutral-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:active:scale-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          {isInStock ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}