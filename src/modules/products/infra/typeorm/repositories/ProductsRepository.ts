import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: {
        name,
      },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const findProducts = await this.ormRepository.find({
      where: {
        id: In(products.map(product => product.id)),
      },
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProductPromises = products.map(product =>
      this.ormRepository
        .findOne(product.id)
        .then(findProduct => {
          if (!findProduct) {
            return;
          }

          findProduct.quantity -= product.quantity;
          return findProduct;
        })
        .then(findProduct => {
          if (!findProduct) {
            return;
          }
          return this.ormRepository.save(findProduct);
        }),
    );

    const updatedProducts = await Promise.all(updatedProductPromises);

    const filteredUpdatedProducts: Product[] = [];

    updatedProducts.forEach(product => {
      if (product) {
        filteredUpdatedProducts.push(product);
      }
    });

    return filteredUpdatedProducts;
  }
}

export default ProductsRepository;
