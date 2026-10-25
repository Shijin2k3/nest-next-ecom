import { ProductService } from "@/app/services";
import {
  Product,
  ProductQueryParams,
  ProductResponse,
} from "@/types/product.type";
import { useCallback, useState } from "react";

export function useProducts() {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [error, setError] = useState<string | null>(null);

  const getProducts = useCallback(
    async (params?: ProductQueryParams): Promise<ProductResponse | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await ProductService.getProducts(params);
        setProducts(response?.data);
        setMeta(response.meta);

        return response;
      } catch (error) {
        const message = `Failed to fetch Products :${error}`;
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );
  return {
    isLoading,
    products,
    setProducts,
    getProducts,
    error,
    meta,
  };
}
