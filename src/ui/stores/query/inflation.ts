import { computed } from "mobx";
import { Dec } from "@chainapsis/cosmosjs/common/decimal";
import { DecUtils } from "../../../common/dec-utils";
import { ObservableQuerySupplyTotal } from "./supply";
import { MintingInflation, StakingPool } from "./types";
import { ObservableChainQuery } from "./chain-query";

export class ObservableQueryInflation {
  constructor(
    private readonly _queryMint: ObservableChainQuery<MintingInflation>,
    private readonly _queryPool: ObservableChainQuery<StakingPool>,
    private readonly _querySupplyTotal: ObservableQuerySupplyTotal
  ) {}

  get error() {
    return (
      this._queryMint.error ??
      this._queryPool.error ??
      this._querySupplyTotal.getQueryStakeDenom().error
    );
  }

  get isFetching() {
    return (
      this._queryMint.isFetching ||
      this._queryPool.isFetching ||
      this._querySupplyTotal.getQueryStakeDenom().isFetching
    );
  }

  // Return an inflation string with up to one decimals.
  // If the staking pool info is fetched, this will consider this info for calculating the more accurate value.
  @computed
  get inflation(): string {
    if (this._queryMint.response) {
      let dec = new Dec(this._queryMint.response.data.result).mul(
        DecUtils.getPrecisionDec(2)
      );
      if (
        this._queryPool.response &&
        this._querySupplyTotal.getQueryStakeDenom().response
      ) {
        const bondedToken = new Dec(
          this._queryPool.response.data.result.bonded_tokens
        );
        const total = new Dec(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this._querySupplyTotal.getQueryStakeDenom().response!.data.result
        );
        if (total.gt(new Dec(0))) {
          const ratio = bondedToken.quo(total);

          dec = dec.quo(ratio);
          // TODO: Rounding?
        }
        return DecUtils.trim(dec.toString(1));
      } else {
        return DecUtils.trim(dec.toString(1));
      }
    } else {
      return "";
    }
  }
}
