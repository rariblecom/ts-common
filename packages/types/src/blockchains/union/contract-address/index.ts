import { CustomError } from "@rarible/utils"
import type { AbstractContractAddress } from "../../common"
import type { BlockchainEnum, L1BlockchainByBlockchain, WithBlockchain } from "../enum"
import { toLayerOneBlockchain } from "../enum"
import { parseBlockchainSafe } from "../enum"
import { contractAddressValidators } from "./validators"

/**
 * Contract address format of union service
 *
 * @example
 * ETHEREUM:0xd07dc4262bcdbf85190c01c996b4c06a461d2430
 * POLYGON:0xd07dc4262bcdbf85190c01c996b4c06a461d2430
 * FLOW:A.0x01658d9b94068f3c.CommonNFT
 */

export type UnionContractAddress<Index extends BlockchainEnum = BlockchainEnum> = WithBlockchain<
  Index,
  AbstractContractAddress<L1BlockchainByBlockchain[Index]>
>

export function toUnionContractAddress(value: string): UnionContractAddress | undefined {
  const safe = toUnionContractAddressSafe(value)
  if (!safe) throw new InvalidUnionContractAddressError(value)
  return safe
}

export function toUnionContractAddressSafe(value: string): UnionContractAddress | undefined {
  if (isUnionContractAddress(value)) return value
  return undefined
}

export function isUnionContractAddress(value: string): value is UnionContractAddress {
  const parsed = parseBlockchainSafe(value as WithBlockchain)
  if (!parsed) return false
  const [blockchain, address] = parsed
  const layer1 = toLayerOneBlockchain(blockchain)
  const validator = contractAddressValidators[layer1]
  return validator.validate(address)
}

export class InvalidUnionContractAddressError extends CustomError {
  constructor(address: string) {
    super(`Not a valid union contract address: ${address}`)
  }
}
