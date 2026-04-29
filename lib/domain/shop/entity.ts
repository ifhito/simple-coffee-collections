/**
 * Shop Entity
 *
 * Represents a shop/cafe as an independent entity.
 * Shops are deduplicated by normalized_name at the DB level.
 *
 * @module lib/domain/shop/entity
 */

export type ShopProps = {
  id: string
  name: string
  normalizedName: string
  createdAt: Date
  updatedAt: Date
}

export class Shop {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _normalizedName: string,
    private readonly _createdAt: Date,
    private readonly _updatedAt: Date
  ) {}

  static reconstruct(props: ShopProps): Shop {
    return new Shop(
      props.id,
      props.name,
      props.normalizedName,
      props.createdAt,
      props.updatedAt
    )
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get normalizedName(): string {
    return this._normalizedName
  }

  get createdAt(): Date {
    return this._createdAt
  }

  get updatedAt(): Date {
    return this._updatedAt
  }
}
