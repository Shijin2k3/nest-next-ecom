import {
  Product,
  ProductQueryParams,
  ProductResponse,
} from "@/types/product.type";
import { apiClient } from "./axios.config";

export class ProductService {
  private static readonly ENDPOINT = "/products";
  static async getProducts(params?: ProductQueryParams) {
    const response = await apiClient.get<ProductResponse>(this.ENDPOINT, {
      params,
    });

    return response.data;
  }

  static async getProductsById(id: string) {
    const response = await apiClient.get<Product>(`${this.ENDPOINT}/${id}`);

    return response.data;
  }
}
